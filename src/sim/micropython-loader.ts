/**
 * MicroPython WASM Loader
 * 
 * Loads and initializes the MicroPython WebAssembly module.
 * The MicroPython interpreter is loaded from micropython.mjs via a script tag
 * in index.html and exposes a global loadMicroPython() function.
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

// Cached MicroPython instance (loaded once and reused)
let micropythonInstance: any = null;

/**
 * Load MicroPython WASM module
 * 
 * This function:
 * 1. Waits for the global loadMicroPython function to be available
 * 2. Calls it to initialize the MicroPython interpreter
 * 3. Caches the instance for reuse
 * 
 * @returns Promise resolving to MicroPython instance
 * @throws Error if MicroPython fails to load within timeout
 */
export async function loadMicroPython() {
    // Return cached instance if already loaded
    if (micropythonInstance) {
        return micropythonInstance;
    }
    
    try {
        // Wait for the global loadMicroPython function to be available
        // This is loaded by the <script src="/micropython/micropython.mjs"> tag in index.html
        await waitForGlobal('loadMicroPython', 10000);
        
        // Call the global loadMicroPython function to initialize the interpreter
        // @ts-ignore - loadMicroPython is loaded globally from micropython.mjs
        const mp = await window.loadMicroPython();
        
        // Cache the instance
        micropythonInstance = mp;
        
        return mp;
    } catch (err) {
        console.error('Failed to load MicroPython:', err);
        throw new Error(
            'Failed to load MicroPython. ' +
            'Make sure micropython.mjs is loaded correctly. ' +
            'Check browser console for details.'
        );
    }
}

/**
 * Wait for a global variable to become available
 * 
 * Polls window[globalName] every 100ms until it exists or timeout is reached.
 * 
 * @param globalName - Name of global variable to wait for
 * @param timeout - Maximum time to wait in milliseconds (default 10000ms = 10s)
 * @returns Promise that resolves when global is available
 * @throws Error if timeout is reached
 */
function waitForGlobal(globalName: string, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Check if already available
        // @ts-ignore
        if (typeof window[globalName] !== 'undefined') {
            resolve();
            return;
        }
        
        // Poll every 100ms
        const checkInterval = setInterval(() => {
            // @ts-ignore
            if (typeof window[globalName] !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(
                    `${globalName} failed to load after ${timeout}ms.\n` +
                    `Make sure micropython.mjs is loaded in index.html:\n` +
                    `<script src="/micropython/micropython.mjs" type="module"></script>`
                ));
            }
        }, 100);
    });
}

/**
 * Run Python code in MicroPython interpreter
 * 
 * This function:
 * 1. Initializes REPL with stdout capture
 * 2. Runs the Python code
 * 3. Returns any stdout output
 * 
 * @param mp - MicroPython instance
 * @param code - Python code to execute
 * @returns Promise resolving to stdout output (string)
 * @throws Error if Python execution fails
 */
export async function runPythonCode(mp: any, code: string): Promise<string> {
    let stdout = '';
    
    try {
        // Initialize REPL with stdout capture
        // This redirects Python's print() to our JavaScript function
        mp.replInit({
            stdout: (char: string) => {
                stdout += char;
            }
        });

        // Execute the Python code
        await mp.runPython(code);
        
        return stdout;
    } catch (err: any) {
        // Convert MicroPython errors to more readable format
        const errorMessage = err.message || String(err);
        
        // Clean up common error patterns
        let cleanError = errorMessage;
        
        // Extract just the Python error if it's wrapped
        if (cleanError.includes('Traceback')) {
            // Keep just the Traceback part
            const tracebackMatch = cleanError.match(/Traceback[\s\S]*/);
            if (tracebackMatch) {
                cleanError = tracebackMatch[0];
            }
        }
        
        throw new Error(cleanError);
    }
}
