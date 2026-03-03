// The contents of this file of Forrest Milner. Hereby granted modification privileges under the terms of the MIT License to ENES100 Staff indefinitely.
// Distribution not permitted. Only for use on this project (enes100-simulator).

export function generateID(): string {
    return Math.random().toString(36).slice(-8);
}

export function formatBytes(a: number): string {
    if (!+a) return "0 B";
    const d = Math.floor(Math.log(a) / Math.log(1024));
    const c = a / Math.pow(1024, d) < 10 ? 1 : 0;
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]}`
}

export function round(num: number, precision: number = 0): number {
    if (Math.abs(num) < Math.pow(10, -precision - 1)) return 0;
    if(!Number.isFinite(num)) return num;
    return +(Math.round(Number(num + "e" + precision)) + "e-" + precision);
}


export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export async function sleep(ms: number) {
    // @ts-ignore
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function awaitAnimationFrame(): Promise<void> {
    // @ts-ignore
    return new Promise(requestAnimationFrame);
}
export const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black'];