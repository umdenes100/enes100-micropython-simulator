import type {CRuntime} from "../JSCPPTypes";
import {get} from "svelte/store";
import {markerId, output, robot, teamName, teamType} from "../../state";
import type {Robot} from "../Types";
import {round} from "../utils";
import {addIgnoredVariable} from "../code";

let $robot: Robot;
robot.subscribe(value => $robot = value);

export const Enes100Defines: { [key: string]: number } = {
    "CRASH_SITE": 0,
    "DATA": 1,
    "MATERIAL": 2,
    "FIRE": 3,
    "WATER": 4,
    "SEED": 5,
    "DIRECTION": 0,
    "LENGTH": 1,
    "HEIGHT": 2,
    "NORMAL_X": 0,
    "NORMAL_Y": 1,
    "CYCLE": 0,
    "MAGNETISM": 1,
    "MAGNETIC": 0,
    "NOT_MAGNETIC": 1,
    "WEIGHT": 0,
    "MATERIAL_TYPE": 1,
    "FOAM": 0,
    "PLASTIC": 1,
    "HEAVY": 0,
    "MEDIUM": 1,
    "LIGHT": 2,
    "NUM_CANDLES": 0,
    "TOPOGRAPHY": 1,
    "TOP_A": 0,
    "TOP_B": 1,
    "TOP_C": 2,
    "DEPTH": 0,
    "WATER_TYPE": 1,
    "FRESH_UNPOLLUTED": 0,
    "FRESH_POLLUTED": 1,
    "LOCATION": 0,
    "PERCENTAGE": 1,
}
let begun = false;

// Enes100.begin(const char* teamName, byte teamType, int markerId, int roomNumber, int wifiModuleTX, int wifiModuleRX)
function begin(rt: CRuntime, _this: any, _teamName: string, _teamType: number, _markerId: number, _roomNumber: number, _wifiModuleTX: number, _wifiModuleRX: number) {
    teamName.set(rt.makeValueString(_teamName).replaceAll('"', ''));
    const teamTypeString = rt.makeValueString(_teamType).replaceAll('"', '')
    // See if we can make it a number
    if (!isNaN(Number(teamTypeString))) {
        teamType.set(Number(teamTypeString) as any);
    } else {
        throw new Error(`In Enes100.begin, you used an invalid team type: ${teamTypeString}. Remember, team type is not a string! (Ex: should be FIRE not "FIRE")`)
    }
    // Same for marker ID
    const markerIdString = rt.makeValueString(_markerId).replaceAll('"', '')
    if (!isNaN(Number(markerIdString))) {
        markerId.set(Number(markerIdString));
    } else {
        throw new Error(`In Enes100.begin, you used an invalid marker ID: ${markerIdString}. Remember, marker ID is not a string! (Ex: should be 1 not "1")`)
    }
    // Room number is ignored in simulator
    // console.log('Began with team name:', get(teamName), 'team type:', get(teamType), 'marker ID:', get(markerId))
    begun = true;
}

// Enes100.getX() - $robot.x
function getX(rt: CRuntime, _this: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.getX()')
    return rt.val(rt.intTypeLiteral, $robot.x, false)
}

// Enes100.getY() - $robot.y
function getY(rt: CRuntime, _this: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.getY()')
    return rt.val(rt.intTypeLiteral, $robot.y, false)
}

// Enes100.getTheta() - $robot.angle
function getTheta(rt: CRuntime, _this: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.getTheta()')
    return rt.val(rt.intTypeLiteral, $robot.angle, false)
}

// Enes100.isVisible() - true
function isVisible(rt: CRuntime, _this: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.isVisible()')
    return rt.val(rt.boolTypeLiteral, true, false)
}

// Enes100.isConnected() - true if team name is not ''
function isConnected(rt: CRuntime, _this: any) {
    return rt.val(rt.boolTypeLiteral, get(teamName) !== '', false)
}

// Enes100.print(Type message) - console.log(message)
function print(rt: CRuntime, _this: any, a: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.print(...)')
    output.update(e => (e + rt.makeValueString(a).replaceAll('"', '')).slice(-10000));
}

// Enes100.println(Type message) - console.log(message)
function println(rt: CRuntime, _this: any, a: any) {
    if (!begun) throw new Error('You must call Enes100.begin(...) before calling Enes100.println(...)')
    output.update(e => (e + rt.makeValueString(a).replaceAll('"', '') + '\n').slice(-10000));
}

// Enes100.mission(int type, int message) - print appropriate message
function mission(rt: CRuntime, _this: any, type: any, message: any) {
    if (!begun) throw (new Error('You must call Enes100.begin(...) before calling Enes100.mission(...)'));
    const opts: { [key: number]: { [key: number]: (n: number) => string } } = {
        0: {
            0: (msg: number) => `The direction of the abnormality is in the ${['x', 'y'][msg]} direction.`,
            1: (mm: number) => `The length of the side with abnormality is ${mm}mm.`,
            2: (mm: number) => `The height of the side with abnormality is ${mm}mm.`,
        },
        1: {
            0: (msg: number) => `The duty cycle is ${msg}%.`,
            1: (msg: number) => `The disk is ${['MAGNETIC', 'NOT MAGNETIC'][msg]}.`,
        },
        2: {
            0: (msg: number) => `The weight of the material is ${['HEAVY', 'MEDIUM', 'LIGHT'][msg]}.`,
            1: (msg: number) => `The material is ${['SQUISHY', 'NOT SQUISHY'][msg]}.`,
        },
        3: {
            0: (msg: number) => `The number of candles lit is ${msg}.`,
            1: (msg: number) => `The topography of the fire mission is: ${['A', 'B', 'C'][msg]}`,
        },
        4: {
            0: (msg: number) => `The depth of the water is ${msg}mm.`,
            1: (msg: number) => `The water is ${['FRESH and UNPOLLUTED', 'FRESH and POLLUTED'][msg]}.`,
        },
        5: {
            0: (msg: number) => `The location of the anomaly is ${round(msg / 1000)},${msg % 1000}`,
            1: (msg: number) => `The percentage of the anomaly is ${msg}`,
        }
    }
    try {
        output.update(e => e + opts[get(teamType)][type.v](message.v) + '\n');
    } catch (e) {
        throw new Error(`In Enes100.mission, you used an invalid type or message. Did you use the correct team type in Enes100.begin(...)?`)
    }
}

// Enes100.MLGetPrediction() - unsupported
function MLGetPrediction() {
    throw new Error('MLGetPrediction is not supported in the simulator!')
}

// noinspection JSUnusedGlobalSymbols
export const Enes100H = {
    load(rt: CRuntime) {
        begun = false;

        // rt.interp.newMacro("peep", "poop")
        rt.interp.newMacro({type: 'Identifier', val: "MOTOR_RPM", space: ' '}, [{val: String(255), space: ' ', type: "Seperator"}])
        const typeVisionSystemClient = rt.newClass("VisionSystemClient", []);
        const typeSig = rt.getTypeSignature(typeVisionSystemClient);
        rt.types[typeSig].father = "object";
        rt.regFunc(begin, typeVisionSystemClient, "begin", [rt.normalPointerType(rt.charTypeLiteral), rt.intTypeLiteral, rt.intTypeLiteral, rt.intTypeLiteral, rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);
        rt.regFunc(getX, typeVisionSystemClient, "getX", [], rt.floatTypeLiteral);
        rt.regFunc(getY, typeVisionSystemClient, "getY", [], rt.floatTypeLiteral);
        rt.regFunc(getTheta, typeVisionSystemClient, "getTheta", [], rt.floatTypeLiteral);
        rt.regFunc(isVisible, typeVisionSystemClient, "isVisible", [], rt.boolTypeLiteral);
        rt.regFunc(isConnected, typeVisionSystemClient, "isConnected", [], rt.boolTypeLiteral);
        rt.regFunc(print, typeVisionSystemClient, "print", ["?"], rt.voidTypeLiteral);
        rt.regFunc(println, typeVisionSystemClient, "println", ["?"], rt.voidTypeLiteral);
        rt.regFunc(mission, typeVisionSystemClient, "mission", [rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);
        rt.regFunc(MLGetPrediction, typeVisionSystemClient, "MLGetPrediction", [], rt.voidTypeLiteral);


        // Make an instance of the class called enes100
        rt.defVar("Enes100", typeVisionSystemClient, rt.defaultValue(typeVisionSystemClient, false));
        for (let key in Enes100Defines) {
            // noinspection SpellCheckingInspection (Seperator)
            rt.interp.newMacro({type: 'Identifier', val: key, space: ' '}, [{val: String(Enes100Defines[key]), space: ' ', type: "Seperator"}])
        }

        rt.regFunc((rt: CRuntime, _this: any, x: any, y: any) => rt.val(rt.floatTypeLiteral, x.v * 1000 + y.v, false)
            , "global", "Coordinate", [rt.intTypeLiteral, rt.intTypeLiteral], rt.floatTypeLiteral);
        addIgnoredVariable("Coordinate");
    }
}