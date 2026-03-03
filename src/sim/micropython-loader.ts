// Global reference to MicroPython
let micropythonInstance: any = null;

export async function loadMicroPython() {
    if (micropythonInstance) {
        console.log('Returning cached MicroPython instance');
        return micropythonInstance;
    }

    console.log('Starting MicroPython load...');
    
    try {
        // Wait for MicroPython to be available (loaded via script tag)
        console.log('Waiting for loadMicroPython global...');
        await waitForGlobal('loadMicroPython', 10000);
        console.log('loadMicroPython global found!');

        // @ts-ignore - loadMicroPython is loaded globally from the script tag
        console.log('Calling window.loadMicroPython()...');
        const mp = await window.loadMicroPython();
        console.log('MicroPython instance created:', mp);

        micropythonInstance = mp;
        console.log('MicroPython loaded successfully');
        return mp;
    } catch (err) {
        console.error('ERROR in loadMicroPython:', err);
        throw err;
    }
}

function waitForGlobal(globalName: string, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Check if already available
        // @ts-ignore
        if (typeof window[globalName] !== 'undefined') {
            console.log(`${globalName} already available`);
            resolve();
            return;
        }
        
        console.log(`Waiting for ${globalName}...`);
        const checkInterval = setInterval(() => {
            // @ts-ignore
            if (typeof window[globalName] !== 'undefined') {
                clearInterval(checkInterval);
                console.log(`${globalName} is now available`);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.error(`${globalName} failed to load after ${timeout}ms`);
                reject(new Error(`${globalName} failed to load after ${timeout}ms. Make sure micropython.mjs is loaded in index.html`));
            }
        }, 100);
    });
}

export async function runPythonCode(mp: any, code: string): Promise<string> {
    // Capture stdout
    let stdout = '';
    
    try {
        console.log('Initializing REPL...');
        // Initialize REPL with stdout capture
        mp.replInit({
            stdout: (char: string) => {
                stdout += char;
            }
        });

        console.log('Running Python code...');
        // Run the Python code
        await mp.runPython(code);
        console.log('Python code completed, stdout:', stdout);
        return stdout;
    } catch (err: any) {
        console.error('Python execution error:', err);
        throw new Error(err.message || String(err));
    }
}