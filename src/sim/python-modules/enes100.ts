import { get } from "svelte/store";
import { markerId, output, robot, teamName, teamType } from "../../state";
import type { Robot } from "../Types";
import { round } from "../utils";

let $robot: Robot;
robot.subscribe(value => $robot = value);

let begun = false;

// Constants that students can use in Python
export const Enes100Constants = {
    // Mission types
    CRASH_SITE: 0,
    DATA: 1,
    MATERIAL: 2,
    FIRE: 3,
    WATER: 4,
    SEED: 5,
    
    // Crash site types
    DIRECTION: 0,
    LENGTH: 1,
    HEIGHT: 2,
    NORMAL_X: 0,
    NORMAL_Y: 1,
    
    // Data types
    CYCLE: 0,
    MAGNETISM: 1,
    MAGNETIC: 0,
    NOT_MAGNETIC: 1,
    
    // Material types
    WEIGHT: 0,
    MATERIAL_TYPE: 1,
    FOAM: 0,
    PLASTIC: 1,
    HEAVY: 0,
    MEDIUM: 1,
    LIGHT: 2,
    
    // Fire types
    NUM_CANDLES: 0,
    TOPOGRAPHY: 1,
    TOP_A: 0,
    TOP_B: 1,
    TOP_C: 2,
    
    // Water types
    DEPTH: 0,
    WATER_TYPE: 1,
    FRESH_UNPOLLUTED: 0,
    FRESH_POLLUTED: 1,
    
    // Seed types
    LOCATION: 0,
    PERCENTAGE: 1,
    
    // Other
    MOTOR_RPM: 255
};

// Export functions that Python will call
export const Enes100API = {
    // Enes100.begin(teamName, teamType, markerId, roomNumber, wifiModuleTX, wifiModuleRX)
    begin: (
        _teamName: string,
        _teamType: number,
        _markerId: number,
        _roomNumber: number = 0,
        _wifiModuleTX: number = 0,
        _wifiModuleRX: number = 0
    ) => {
        // Validate team name
        const name = String(_teamName).replace(/"/g, '');
        teamName.set(name);
        
        // Validate team type
        if (typeof _teamType !== 'number' || _teamType < 0 || _teamType > 5) {
            throw new Error(
                `In enes100.begin(), you used an invalid team type: ${_teamType}. ` +
                `Valid values are: CRASH_SITE (0), DATA (1), MATERIAL (2), FIRE (3), WATER (4), SEED (5). ` +
                `Remember to use the constant, not a string! (Ex: FIRE not "FIRE")`
            );
        }
        teamType.set(_teamType);
        
        // Validate marker ID
        if (typeof _markerId !== 'number') {
            throw new Error(
                `In enes100.begin(), you used an invalid marker ID: ${_markerId}. ` +
                `Remember, marker ID is a number! (Ex: should be 1 not "1")`
            );
        }
        markerId.set(_markerId);
        
        begun = true;
    },
    
    // Enes100.getX() - returns robot's x position
    getX: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_x()');
        }
        return $robot.x;
    },
    
    // Enes100.getY() - returns robot's y position
    getY: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_y()');
        }
        return $robot.y;
    },
    
    // Enes100.getTheta() - returns robot's angle
    getTheta: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.get_theta()');
        }
        return $robot.angle;
    },
    
    // Enes100.isVisible() - returns whether robot is visible to vision system
    isVisible: () => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.is_visible()');
        }
        return true; // Always true in simulator
    },
    
    // Enes100.isConnected() - returns whether wifi is connected
    isConnected: () => {
        return get(teamName) !== '';
    },
    
    // Enes100.print(message) - prints without newline
    print: (message: any) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.print()');
        }
        const text = String(message).replace(/"/g, '');
        output.update(e => (e + text).slice(-10000));
    },
    
    // Enes100.println(message) - prints with newline
    println: (message: any) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.println()');
        }
        const text = String(message).replace(/"/g, '');
        output.update(e => (e + text + '\n').slice(-10000));
    },
    
    // Enes100.mission(type, message) - transmits mission data
    mission: (type: number, message: number) => {
        if (!begun) {
            throw new Error('You must call enes100.begin() before calling enes100.mission()');
        }
        
        const currentTeamType = get(teamType);
        
        // Mission message templates
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
                `In enes100.mission(), you used an invalid type (${type}) or message (${message}). ` +
                `Did you use the correct team type in enes100.begin()? Current team type: ${currentTeamType}`
            );
        }
    },
    
    // Enes100.coordinate(x, y) - creates a coordinate value
    coordinate: (x: number, y: number) => {
        return x * 1000 + y;
    },
    
    // Enes100.MLGetPrediction() - not supported in simulator
    MLGetPrediction: () => {
        throw new Error('ML_get_prediction() is not supported in the simulator!');
    },
    
    // Get all constants
    getConstants: () => {
        return Enes100Constants;
    }
};

// Reset function to be called when starting a new code session
export function resetEnes100() {
    begun = false;
}