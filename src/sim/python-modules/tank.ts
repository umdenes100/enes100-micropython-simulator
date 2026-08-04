/**
 * Tank Module - Python API for Tank Robot Control
 * 
 * This module provides the Tank API that students use in Python.
 * It interfaces with the robot simulation to control motors and read sensors.
 * 
 * Available functions:
 * - begin() - Initialize the tank (must be called first)
 * - turn_off_motors() - Stop all motors
 * - set_left_motor_pwm(pwm) - Set left motors speed (-255 to 255)
 * - set_right_motor_pwm(pwm) - Set right motors speed (-255 to 255)
 * - read_distance_sensor(sensor_id) - Read ultrasonic distance sensor
 * - read_bump_sensor(sensor_id) - Read bump/touch sensor
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

import { robot } from "../../state";
import type { Robot } from "../Types";
import { clamp } from "../utils";
import { distanceSensor } from "../simulator";

// Subscribe to robot state updates
let $robot: Robot;
robot.subscribe(value => $robot = value);

// Tank state
let begun = false;
const lastSet = { left: 0, right: 0 };
let straightTimeout: number | undefined;

/**
 * Calculate and update robot velocity based on motor speeds
 * 
 * Robot motion model:
 * - Linear velocity (v) = average of left and right speeds
 * - Angular velocity (w) = difference between right and left speeds
 * 
 * This creates differential drive behavior like a real tank robot
 */
function calculateRobot() {
    robot.set({
        ...$robot,
        v: (lastSet.left + lastSet.right) / 4,  // Linear velocity
        w: (lastSet.right - lastSet.left)        // Angular velocity
    });
}

/**
 * Tank API exported to Python
 * These functions are called from Python via js.TankAPI.functionName()
 */
export const TankAPI = {
    /**
     * Initialize the tank
     * Must be called before using any other tank functions
     * 
     * Python usage: tank.begin()
     */
    begin: () => {
        begun = true;
    },

    /**
     * Stop all motors (set both to 0)
     * 
     * Python usage: tank.turn_off_motors()
     * 
     * @throws Error if begin() not called first
     */
    turnOffMotors: () => {
        if (!begun) {
            throw new Error('You must call tank.begin() before calling tank.turn_off_motors()');
        }
        robot.set({ ...$robot, v: 0, w: 0 });
        lastSet.left = 0;
        lastSet.right = 0;
    },

    /**
     * Set left motor speed
     * 
     * Python usage: tank.set_left_motor_pwm(100)
     * 
     * @param pwm - Motor speed from -255 (full reverse) to 255 (full forward)
     * @throws Error if begin() not called first
     * @throws Error if pwm outside valid range
     */
    setLeftMotorPWM: (pwm: number) => {
        if (!begun) {
            throw new Error('You must call tank.begin() before calling tank.set_left_motor_pwm()');
        }
        if (pwm !== clamp(pwm, -255, 255)) {
            throw new Error(`PWM must be -255 to 255, got ${pwm}`);
        }
        
        // Normalize to -1.0 to 1.0 range
        lastSet.left = pwm / 255;
        
        // Delay calculation slightly to allow both motors to be set
        // This prevents jerky motion when setting left/right in sequence
        clearTimeout(straightTimeout);
        straightTimeout = setTimeout(calculateRobot, 110);
    },

    /**
     * Set right motor speed
     * 
     * Python usage: tank.set_right_motor_pwm(100)
     * 
     * @param pwm - Motor speed from -255 (full reverse) to 255 (full forward)
     * @throws Error if begin() not called first
     * @throws Error if pwm outside valid range
     */
    setRightMotorPWM: (pwm: number) => {
        if (!begun) {
            throw new Error('You must call tank.begin() before calling tank.set_right_motor_pwm()');
        }
        if (pwm !== clamp(pwm, -255, 255)) {
            throw new Error(`PWM must be -255 to 255, got ${pwm}`);
        }
        
        // Normalize to -1.0 to 1.0 range
        lastSet.right = pwm / 255;
        
        clearTimeout(straightTimeout);
        
        // If left motor is already set, calculate immediately
        // Otherwise delay to allow left motor to be set
        if (lastSet.left === 0) {
            straightTimeout = setTimeout(calculateRobot, 110);
        } else {
            calculateRobot();
        }
    },

    /**
     * Read ultrasonic distance sensor
     * 
     * Python usage: distance = tank.read_distance_sensor(1)
     * 
     * @param sensorId - Sensor ID (1-7)
     * @returns Distance in meters (max 1.0), or -1 if nothing detected
     * @throws Error if begin() not called first
     * @throws Error if sensorId invalid
     */
    readDistanceSensor: (sensorId: number) => {
        if (!begun) {
            throw new Error('You must call tank.begin() before calling tank.read_distance_sensor()');
        }
        if (sensorId !== clamp(sensorId, 1, 7)) {
            throw new Error(`sensorId must be 1-7, got ${sensorId}`);
        }
        
        // angle=0 means straight ahead, maxDistance=1 meter
        return distanceSensor(0, 1);
    },

    /**
     * Read bump/touch sensor
     * 
     * Python usage: is_pressed = tank.read_bump_sensor(1)
     * 
     * @param sensorId - Sensor ID (1-7)
     * @returns true if sensor detects obstacle within 5cm, false otherwise
     * @throws Error if begin() not called first
     * @throws Error if sensorId invalid
     */
    readBumpSensor: (sensorId: number) => {
        if (!begun) {
            throw new Error('You must call tank.begin() before calling tank.read_bump_sensor()');
        }
        if (sensorId !== clamp(sensorId, 1, 7)) {
            throw new Error(`sensorId must be 1-7, got ${sensorId}`);
        }
        
        // Check for obstacles within 5cm
        const val = distanceSensor(0, 0.1);
        return val !== -1 && val < 0.05;
    }
};

/**
 * Reset tank state to initial conditions
 * Called when starting new code execution
 */
export function resetTank() {
    begun = false;
    lastSet.left = 0;
    lastSet.right = 0;
    clearTimeout(straightTimeout);
}
