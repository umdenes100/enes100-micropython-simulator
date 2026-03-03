/***


 */
export function checkCode(code: string): [string, boolean] {
    if (!code.includes("setup(") || !code.includes("loop(")) {
        alert("Code must contain setup and loop functions.")
        return [code, false];
    }

    // Check for empty loop
    const loopBody = extractFunctionBody(code, "loop");
    
    if (loopBody === null || !loopBody.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim()) {
        alert("Warning: Your loop function is empty. Please add some code (a delay is ok).");
        return [code, false];
    }

    for (const header of ["Enes100.h", "Tank.h", "Arduino.h"]) {
        if (!code.includes(`#include "${header}"`)) {
            alert(`Your program does not include the library ${header}. I'll add it for you at the top with "#include "${header}"".`)
            return [`#include "${header}"\n${code}`, false]
        }
    }
    if (code.includes("Enes100.location.x") || code.includes("Enes100.location.y") || code.includes("Enes100.location.x")) {
        if (confirm('The simulator only supports getX(), getY(), and getTheta() functions. I see you have Enes100.location in your code - would you like me to replace those for you?')) {
            return [code
                .replaceAll("Enes100.location.x", "Enes100.getX()")
                .replaceAll("Enes100.location.y", "Enes100.getY()")
                .replaceAll("Enes100.location.theta", "Enes100.getTheta()"),
                 false]
        } else
            return [code, true];
    }
    return [code, true];
}

export function errorClarifiers(error: string): string {
    console.log(error)
    if (error.includes("Parsing Failure:"))
        return error.replaceAll("Parsing Failure:", "Parsing Failure: (Did you forget a semi-colon?)")
    if (error.includes("no method begin in VisionSystemClient accepts"))
        return `${error}\n\nHint: team type is not a string! (Ex: should be FIRE not "FIRE") Consult the documentation for more information.`
    if (error.includes("Cannot read properties of undefined (reading 'type')"))
        return `Too many arguments for function\n\n(${error})`
    if (error.includes(" in $global")) // Isn't a helpful error message
        error = error.replaceAll(" in $global", "")
    if (error.includes('cannot find file'))
        return `${error}\n\nHint: no Arduino libraries other than Arduino.h, Enes100.h, and Tank.h are supported. From the std lib, only iostream (only cin and cout and endl), cmath, cctype, cstring, cstdio (partial), cstdlib (partial) are supported. Click the info button to learn more about limitations of the simulator.`
    if (error.includes('method o(()) is not defined'))
        return `${error.replaceAll('method o(()) is not defined in ', 'You cannot call this as a function: ')}\n\nHint: Review what the functions you can call are.`
    if (error.includes('method abs with parameters ((double)) is already defined'))
        return `Please include math.h / cmath before including Enes100.h or Tank.h.`
    return error;
}

function extractFunctionBody(code: string, functionName: string): string | null {
    const regex = new RegExp(`${functionName}\\([^)]*\\)\\s*\\{([^}]*)\\}`);
    const match = code.match(regex);
    return match ? match[1].trim() : null;
}