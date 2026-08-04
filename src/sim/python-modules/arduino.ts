/**
 * Arduino Module - Python API for Arduino-style Functions
 * 
 * This module provides Arduino-compatible math and timing functions.
 * Note: Pin I/O functions are not supported in the simulator.
 * 
 * Available functions:
 * - Math: abs, min, max, constrain, round, radians, degrees, sq, map
 * - Timing: millis, micros
 * - Random: random
 * 
 * Constants:
 * - PI, HALF_PI, TWO_PI, DEG_TO_RAD, RAD_TO_DEG, EULER
 * - HIGH, LOW, INPUT, OUTPUT, etc.
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

import { round as roundUtil } from "../utils";

// Track when the module was loaded (for millis/micros)
let loadTime: number = Date.now();

/**
 * Arduino constants
 * Students can access these via ArduinoAPI.getConstants() in Python
 */
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

/**
 * Arduino API exported to Python
 */
export const ArduinoAPI = {
    // ========== MATH FUNCTIONS ==========
    
    /**
     * Absolute value
     * Python usage: result = js.ArduinoAPI.abs(-5)  # Returns 5
     */
    abs: (x: number) => Math.abs(x),
    
    /**
     * Minimum of two values
     * Python usage: result = js.ArduinoAPI.min(10, 20)  # Returns 10
     */
    min: (a: number, b: number) => Math.min(a, b),
    
    /**
     * Maximum of two values
     * Python usage: result = js.ArduinoAPI.max(10, 20)  # Returns 20
     */
    max: (a: number, b: number) => Math.max(a, b),
    
    /**
     * Constrain value between limits
     * Python usage: result = js.ArduinoAPI.constrain(150, 0, 100)  # Returns 100
     */
    constrain: (amt: number, low: number, high: number) => {
        return Math.min(Math.max(amt, low), high);
    },
    
    /**
     * Round to nearest integer
     * Python usage: result = js.ArduinoAPI.round(3.7)  # Returns 4
     */
    round: (x: number) => Math.round(x),
    
    /**
     * Convert degrees to radians
     * Python usage: rad = js.ArduinoAPI.radians(180)  # Returns π
     */
    radians: (deg: number) => deg * Math.PI / 180,
    
    /**
     * Convert radians to degrees
     * Python usage: deg = js.ArduinoAPI.degrees(Math.PI)  # Returns 180
     */
    degrees: (rad: number) => rad * 180 / Math.PI,
    
    /**
     * Square a number
     * Python usage: result = js.ArduinoAPI.sq(5)  # Returns 25
     */
    sq: (x: number) => x * x,
    
    // ========== TIMING FUNCTIONS ==========
    
    /**
     * Milliseconds since program start
     * Python usage: ms = js.ArduinoAPI.millis()
     */
    millis: () => Date.now() - loadTime,
    
    /**
     * Microseconds since program start
     * Python usage: us = js.ArduinoAPI.micros()
     */
    micros: () => (Date.now() - loadTime) * 1000,
    
    // ========== MAPPING & RANDOM ==========
    
    /**
     * Map value from one range to another
     * Python usage: pwm = js.ArduinoAPI.map(50, 0, 100, 0, 255)
     * 
     * @param x - Value to map
     * @param in_min - Input range minimum
     * @param in_max - Input range maximum
     * @param out_min - Output range minimum
     * @param out_max - Output range maximum
     * @returns Mapped value
     */
    map: (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },
    
    /**
     * Random number from 0 to max (exclusive)
     * Python usage: val = js.ArduinoAPI.random(100)  # 0-99
     */
    random: (max: number) => Math.random() * max,
    
    /**
     * Random number between min and max (exclusive)
     * Python usage: val = js.ArduinoAPI.randomWithMin(50, 100)  # 50-99
     */
    randomWithMin: (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    },
    
    // ========== PIN FUNCTIONS (NOT SUPPORTED) ==========
    // These throw errors because the simulator doesn't have real hardware pins
    
    pinMode: () => {
        throw new Error(
            'pinMode() is not supported in the simulator.\n' +
            'The simulator does not have real Arduino pins.'
        );
    },
    
    digitalWrite: () => {
        throw new Error(
            'digitalWrite() is not supported in the simulator.\n' +
            'Use tank.set_left_motor_pwm() and tank.set_right_motor_pwm() instead.'
        );
    },
    
    digitalRead: () => {
        throw new Error(
            'digitalRead() is not supported in the simulator.\n' +
            'Use tank.read_bump_sensor() instead.'
        );
    },
    
    analogWrite: () => {
        throw new Error(
            'analogWrite() is not supported in the simulator.\n' +
            'Use tank.set_left_motor_pwm() and tank.set_right_motor_pwm() instead.'
        );
    },
    
    analogRead: () => {
        throw new Error(
            'analogRead() is not supported in the simulator.\n' +
            'Use tank.read_distance_sensor() instead.'
        );
    },
    
    // ========== CONSTANTS ==========
    
    /**
     * Get all Arduino constants
     * Python usage: constants = js.ArduinoAPI.getConstants()
     */
    getConstants: () => ArduinoConstants
};

/**
 * Reset Arduino module state
 * Called when starting new code execution
 */
export function resetArduino() {
    loadTime = Date.now();
}
