// Global reference to MicroPython
let micropythonInstance: any = null;

export async function loadMicroPython() {
    if (micropythonInstance) {
        return micropythonInstance;
    }

    // Wait for MicroPython to be available (loaded via script tag)
    await waitForGlobal('loadMicroPython', 10000);

    // @ts-ignore - loadMicroPython is loaded globally
    const mp = await loadMicroPython();

    micropythonInstance = mp;
    return mp;
}

function waitForGlobal(globalName: string, timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            // @ts-ignore
            if (typeof window[globalName] !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(`${globalName} failed to load`));
            }
        }, 100);
    });
}

export async function runPythonCode(mp: any, code: string): Promise<string> {
    // Capture stdout
    let stdout = '';
    
    mp.replInit({
        stdout: (char: string) => {
            stdout += char;
        }
    });

    try {
        await mp.runPython(code);
        return stdout;
    } catch (err: any) {
        throw new Error(err.message || String(err));
    }
}