import { delay as delayState } from "../../state";
import { round } from "../utils";

let loadTime: number = Date.now();

// Arduino constants that students can use in Python
export const ArduinoConstants = {
    // Digital pin states
    HIGH: 0x1,
    LOW: 0x0,
    
    // Pin modes
    INPUT: 0x0,
    OUTPUT: 0x1,
    INPUT_PULLUP: 0x2,
    
    // Math constants
    PI: 3.1415926535897932384626433832795,
    HALF_PI: 1.5707963267948966192313216916398,
    TWO_PI: 6.283185307179586476925286766559,
    DEG_TO_RAD: 0.017453292519943295769236907684886,
    RAD_TO_DEG: 57.295779513082320876798154814105,
    EULER: 2.718281828459045235360287471352,
    
    // Serial/Display
    SERIAL: 0x0,
    DISPLAY: 0x1,
    
    // Bit order
    LSBFIRST: 0,
    MSBFIRST: 1,
    
    // Interrupt modes
    CHANGE: 1,
    FALLING: 2,
    RISING: 3,
};

// Export functions that Python will call
export const ArduinoAPI = {
    // Math functions
    abs: (x: number) => {
        return Math.abs(x);
    },
    
    min: (a: number, b: number) => {
        return Math.min(a, b);
    },
    
    max: (a: number, b: number) => {
        return Math.max(a, b);
    },
    
    constrain: (amt: number, low: number, high: number) => {
        return Math.min(Math.max(amt, low), high);
    },
    
    round: (x: number) => {
        return Math.round(x);
    },
    
    radians: (deg: number) => {
        return deg * Math.PI / 180;
    },
    
    degrees: (rad: number) => {
        return rad * 180 / Math.PI;
    },
    
    sq: (x: number) => {
        return x * x;
    },
    
    // Timing functions
    millis: () => {
        return Date.now() - loadTime;
    },
    
    micros: () => {
        return (Date.now() - loadTime) * 1000;
    },
    
    delay: (ms: number) => {
        delayState.set(ms);
        // This will be handled by the Python wrapper to make it async
    },
    
    delayMicroseconds: (us: number) => {
        delayState.set(round(us / 1000));
        // This will be handled by the Python wrapper to make it async
    },
    
    // Mapping function
    map: (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },
    
    // Random function
    random: (max: number) => {
        return Math.random() * max;
    },
    
    randomWithMin: (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    },
    
    // Pin functions (not supported in simulator - will throw errors)
    pinMode: (pin: number, mode: number) => {
        throw new Error('pinMode() is not supported in the simulator!');
    },
    
    digitalWrite: (pin: number, value: number) => {
        throw new Error('digitalWrite() is not supported in the simulator!');
    },
    
    digitalRead: (pin: number) => {
        throw new Error('digitalRead() is not supported in the simulator!');
    },
    
    analogWrite: (pin: number, value: number) => {
        throw new Error('analogWrite() is not supported in the simulator!');
    },
    
    analogRead: (pin: number) => {
        throw new Error('analogRead() is not supported in the simulator!');
    },
    
    // Get all constants
    getConstants: () => {
        return ArduinoConstants;
    }
};

// Reset function to be called when starting a new code session
export function resetArduino() {
    loadTime = Date.now();
}