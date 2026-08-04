/**
 * Enes100 Module - Python API for Vision System and Communication
 * 
 * This module provides the Enes100 API for:
 * - Vision system positioning (get_x, get_y, get_theta)
 * - WiFi communication (begin, print, println)
 * - Mission transmission (mission)
 * - Connection status (is_visible, is_connected)
 * 
 * All mission types and constants are also defined here.
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

import { get } from "svelte/store";
import { markerId, output, robot, teamName, teamType } from "../../state";
import type { Robot } from "../Types";
import { round } from "../utils";

// Subscribe to robot state
let $robot: Robot;
robot.subscribe(value => $robot = value);

// Enes100 state
let begun = false;

/**
 * Mission type and constant definitions
 * Students use these in Python: FIRE, WATER, NUM_CANDLES, etc.
 */
export const Enes100Constants = {
    // Mission types
    CRASH_SITE: 0,
    DATA: 1,
    MATERIAL: 2,
    FIRE: 3,
    WATER: 4,
    SEED: 5,
    
    // Crash site mission
    DIRECTION: 0,
    LENGTH: 1,
    HEIGHT: 2,
    NORMAL_X: 0,
    NORMAL_Y: 1,
    
    // Data mission
    CYCLE: 0,
    MAGNETISM: 1,
    MAGNETIC: 0,
    NOT_MAGNETIC: 1,
    
    // Material mission
    WEIGHT: 0,
    MATERIAL_TYPE: 1,
    FOAM: 0,
    PLASTIC: 1,
    HEAVY: 0,
    MEDIUM: 1,
    LIGHT: 2,
    
    // Fire mission
    NUM_CANDLES: 0,
    TOPOGRAPHY: 1,
    TOP_A: 0,
    TOP_B: 1,
    TOP_C: 2,
    
    // Water mission
    DEPTH: 0,
    WATER_TYPE: 1,
    FRESH_UNPOLLUTED: 0,
    FRESH_POLLUTED: 1,
    
    // Seed mission
    LOCATION: 0,
    PERCENTAGE: 1,
};

/**
 * Enes100 API exported to Python
 */
export const Enes100API = {
    /**
     * Initialize Enes100 WiFi connection and vision system
     * 
     * Python usage: enes100.begin("Team Name", FIRE, 3)
     * 
     * @param _teamName - Team name (string)
     * @param _teamType - Mission type constant (FIRE, WATER, etc.)
     * @param _markerId - Aruco marker ID (integer)
     * @param _roomNumber - Room number (optional, ignored in simulator)
     * @param _wifiModuleTX - TX pin (optional, ignored in simulator)
     * @param _wifiModuleRX - RX pin (optional, ignored in simulator)
     * @throws Error if teamType is invalid
     * @throws Error if markerId is invalid
     */
    begin: (
        _teamName: string,
        _teamType: number,
        _markerId: number,
        _roomNumber: number = 0,
        _wifiModuleTX: number = 0,
        _wifiModuleRX: number = 0
    ) => {
        // Validate and set team name
        const name = String(_teamName).replace(/"/g, '');
        teamName.set(name);
        
        // Validate team type
        if (typeof _teamType !== 'number' || _teamType < 0 || _teamType > 5) {
            throw new Error(
                `Invalid team type: ${_teamType}\n` +
                `Valid values:\n` +
                `  CRASH_SITE (0), DATA (1), MATERIAL (2)\n` +
                `  FIRE (3), WATER (4), SEED (5)\n` +
                `Remember to use the constant, not a string!\n` +
                `Correct: FIRE\n` +
                `Wrong: "FIRE"`
            );
        }
        teamType.set(_teamType);
        
        // Validate marker ID
        if (typeof _markerId !== 'number') {
            throw new Error(
                `Invalid marker ID: ${_markerId}\n` +
                `Marker ID must be a number, not a string.\n` +
                `Correct: 1\n` +
                `Wrong: "1"`
            );
        }
        markerId.set(_markerId);
        
        begun = true;
    },
    
    /**
     * Get robot's X position from vision system
     * 
     * Python usage: x = enes100.get_x()
     * 
     * @returns X coordinate in meters
     * @throws Error if begin() not called first
     */
    getX: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_x()');
        }
        return $robot.x;
    },
    
    /**
     * Get robot's Y position from vision system
     * 
     * Python usage: y = enes100.get_y()
     * 
     * @returns Y coordinate in meters
     * @throws Error if begin() not called first
     */
    getY: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_y()');
        }
        return $robot.y;
    },
    
    /**
     * Get robot's angle from vision system
     * 
     * Python usage: theta = enes100.get_theta()
     * 
     * @returns Angle in radians (-π to π)
     * @throws Error if begin() not called first
     */
    getTheta: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_theta()');
        }
        return $robot.angle;
    },
    
    /**
     * Check if robot is visible to vision system
     * 
     * Python usage: visible = enes100.is_visible()
     * 
     * @returns Always true in simulator
     * @throws Error if begin() not called first
     */
    isVisible: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.is_visible()');
        }
        return true; // Always visible in simulator
    },
    
    /**
     * Check if WiFi is connected
     * 
     * Python usage: connected = enes100.is_connected()
     * 
     * @returns True if team name is set
     */
    isConnected: () => {
        return get(teamName) !== '';
    },
    
    /**
     * Print message to output (no newline)
     * 
     * Python usage: enes100.print("X = ")
     * 
     * @param message - Message to print
     * @throws Error if begin() not called first
     */
    print: (message: any) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.print()');
        }
        const text = String(message).replace(/"/g, '');
        // Limit output to last 10,000 characters to prevent memory issues
        output.update(e => (e + text).slice(-10000));
    },
    
    /**
     * Print message to output with newline
     * 
     * Python usage: enes100.println("Hello World")
     * 
     * @param message - Message to print
     * @throws Error if begin() not called first
     */
    println: (message: any) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.println()');
        }
        const text = String(message).replace(/"/g, '');
        output.update(e => (e + text + '\n').slice(-10000));
    },
    
    /**
     * Transmit mission data
     * Displays formatted message based on mission type
     * 
     * Python usage: enes100.mission(NUM_CANDLES, 5)
     * 
     * @param type - Mission data type (constant)
     * @param message - Data value
     * @throws Error if begin() not called first
     * @throws Error if type/message invalid for current mission
     */
    mission: (type: number, message: number) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.mission()');
        }
        
        const currentTeamType = get(teamType);
        
        // Mission message templates for each mission type
        const missionMessages: { [key: number]: { [key: number]: (n: number) => string } } = {
            0: { // CRASH_SITE
                0: (msg: number) => `The direction of the abnormality is in the ${['x', 'y'][msg]} direction.`,
                1: (mm: number) => `The length of the side with abnormality is ${mm}mm.`,
                2: (mm: number) => `The height of the side with abnormality is ${mm}mm.`,
            },
            1: { // DATA
                0: (msg: number) => `The duty cycle is ${msg}%.`,
                1: (msg: number) => `The disk is ${['MAGNETIC', 'NOT MAGNETIC'][msg]}.`,
            },
            2: { // MATERIAL
                0: (msg: number) => `The weight of the material is ${['HEAVY', 'MEDIUM', 'LIGHT'][msg]}.`,
                1: (msg: number) => `The material is ${['SQUISHY', 'NOT SQUISHY'][msg]}.`,
            },
            3: { // FIRE
                0: (msg: number) => `The number of candles lit is ${msg}.`,
                1: (msg: number) => `The topography of the fire mission is: ${['A', 'B', 'C'][msg]}`,
            },
            4: { // WATER
                0: (msg: number) => `The depth of the water is ${msg}mm.`,
                1: (msg: number) => `The water is ${['FRESH and UNPOLLUTED', 'FRESH and POLLUTED'][msg]}.`,
            },
            5: { // SEED
                0: (msg: number) => `The location of the anomaly is ${round(msg / 1000)},${msg % 1000}`,
                1: (msg: number) => `The percentage of the anomaly is ${msg}`,
            }
        };
        
        try {
            if (!missionMessages[currentTeamType]) {
                throw new Error(`Invalid team type: ${currentTeamType}`);
            }
            if (!missionMessages[currentTeamType][type]) {
                throw new Error(`Invalid mission type: ${type} for team type ${currentTeamType}`);
            }
            
            const messageText = missionMessages[currentTeamType][type](message);
            output.update(e => e + messageText + '\n');
        } catch (e) {
            throw new Error(
                `Invalid mission() call\n` +
                `Type: ${type}, Message: ${message}\n` +
                `Current team type: ${currentTeamType}\n` +
                `Did you use the correct team type in enes100.begin()?`
            );
        }
    },
    
    /**
     * Create coordinate value for SEED mission
     * 
     * Python usage: enes100.mission(LOCATION, coordinate(100, 200))
     * 
     * @param x - X coordinate (0-999)
     * @param y - Y coordinate (0-999)
     * @returns Encoded coordinate value
     */
    coordinate: (x: number, y: number) => {
        return x * 1000 + y;
    }
};

/**
 * Reset Enes100 state to initial conditions
 * Called when starting new code execution
 */
export function resetEnes100() {
    begun = false;
}
