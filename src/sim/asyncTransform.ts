/**
 * Async Transform
 *
 * MicroPython can only pause execution without freezing the browser inside
 * functions declared `async def`, and only at explicit `await` points.
 * Students should never have to write `async`/`await` themselves (their code
 * should look like normal Arduino-style Python), so this module rewrites
 * their code automatically before it's handed to MicroPython:
 *
 *   1. Every function the student defines (`def name(...):`) becomes
 *      `async def name(...):`, at any indentation level.
 *   2. Every call to one of those functions becomes `await name(...)`.
 *   3. Every `time.sleep(...)` / `time.sleep_ms(...)` call becomes awaited.
 *   4. Any bare `import time` line is removed, since we provide our own
 *      `time` object in the wrapper code (see code.ts). A real `import time`
 *      would silently replace it with MicroPython's actual (blocking) module.
 *
 * This is a text-based, best-effort transformation -- not a full Python
 * parser. Known limitations:
 *   - Only catches direct call sites like `name(...)`. A function referenced
 *     without being called (e.g. `handler = my_function`) is not detected.
 *   - `import time as t` (aliased import) is not stripped, since the
 *     resulting binding doesn't collide with our `time` global -- but calls
 *     through that alias will NOT be async-safe.
 *   - Not designed for classes, lambdas, or functions defined inside
 *     conditionals/loops.
 */

// Matches a function definition at any indentation level. Captures leading
// whitespace (group 1) and the function name (group 2).
const DEF_PATTERN = /^([ \t]*)def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;

// Matches a bare `import time` line (not `import time as x`).
const IMPORT_TIME_PATTERN = /^[ \t]*import\s+time[ \t]*(#.*)?$/gm;

export function transformForAsyncSleep(code: string): string {
    // --- Step 1: collect every function name the student defines ---
    const functionNames = new Set<string>();
    const defScan = new RegExp(DEF_PATTERN);
    let match: RegExpExecArray | null;
    while ((match = defScan.exec(code)) !== null) {
        functionNames.add(match[2]);
    }

    let transformed = code;

    // --- Step 2: rewrite call sites for user-defined functions ---
    // Skip the definition line itself (preceded by "def "),
    // skip dotted calls like `tank.name(` (preceded by "."),
    // skip anything already awaited (preceded by "await ").
    for (const name of functionNames) {
        const callRegex = new RegExp(
            `(?<!def\\s)(?<!\\.)(?<!await\\s)\\b${name}\\s*\\(`,
            'g'
        );
        transformed = transformed.replace(callRegex, `await ${name}(`);
    }

    // --- Step 3: rewrite time.sleep(...) / time.sleep_ms(...) ---
    transformed = transformed.replace(
        /(?<!await\s)\btime\.sleep(_ms)?\s*\(/g,
        (_m, ms) => `await time.sleep${ms ? '_ms' : ''}(`
    );

    // --- Step 4: convert the collected definitions to `async def` ---
    transformed = transformed.replace(DEF_PATTERN, (whole, indent, name) => {
        return functionNames.has(name) ? `${indent}async def ${name}(` : whole;
    });

    // --- Step 5: strip bare `import time` (we supply our own) ---
    transformed = transformed.replace(
        IMPORT_TIME_PATTERN,
        '# import time (removed -- using built-in async-safe time object)'
    );

    return transformed;
}