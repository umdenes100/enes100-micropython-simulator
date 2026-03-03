import type {CRuntime} from "../JSCPPTypes";
import {delay, markerId, output, robot, teamName, teamType} from "../../state";
import type {Robot} from "../Types";
import {addIgnoredVariable} from "../code";
import {round} from "../utils";

let $robot: Robot;
robot.subscribe(value => $robot = value);

export const ArduinoDefines: { [key: string]: string|number } = {
    "HIGH": 0x1,
    "LOW": 0x0,
    "INPUT": 0x0,
    "OUTPUT": 0x1,
    "INPUT_PULLUP": 0x2,
    "PI": 3.1415926535897932384626433832795,
    "HALF_PI": 1.5707963267948966192313216916398,
    "TWO_PI": 6.283185307179586476925286766559,
    "DEG_TO_RAD": 0.017453292519943295769236907684886,
    "RAD_TO_DEG": 57.295779513082320876798154814105,
    "EULER": 2.718281828459045235360287471352,
    "SERIAL": 0x0,
    "DISPLAY": 0x1,
    "LSBFIRST": 0,
    "MSBFIRST": 1,
    "CHANGE": 1,
    "FALLING": 2,
    "RISING": 3,
    "byte": "unsigned char",
    "boolean": "bool",
    "uint8_t": "unsigned char",
}

let loadTime: number;
function functions(rt: CRuntime): { [key: string]: { f: (rt: CRuntime, _this: any, ...args: any[]) => any, args: any[], return: any } } {
    return {
        "abs": {
            f: (rt, _this, x: any) => rt.val(rt.doubleTypeLiteral, Math.abs(x.v)),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "min": {
            f: (rt, _this, a: any, b: any) => rt.val(rt.doubleTypeLiteral, Math.min(a.v, b.v)),
            args: [rt.doubleTypeLiteral, rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "max": {
            f: (rt, _this, a: any, b: any) => rt.val(rt.doubleTypeLiteral, Math.max(a.v, b.v)),
            args: [rt.doubleTypeLiteral, rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "constrain": {
            f: (rt, _this, amt: any, low: any, high: any) => rt.val(rt.doubleTypeLiteral, Math.min(Math.max(amt.v, low.v), high.v)),
            args: [rt.doubleTypeLiteral, rt.doubleTypeLiteral, rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "round": {
            f: (rt, _this, x: any) => rt.val(rt.doubleTypeLiteral, Math.round(x.v)),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "radians": {
            f: (rt, _this, deg: any) => rt.val(rt.doubleTypeLiteral, deg.v * Math.PI / 180),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "degrees": {
            f: (rt, _this, rad: any) => rt.val(rt.doubleTypeLiteral, rad.v * 180 / Math.PI),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "sq": {
            f: (rt, _this, x: any) => rt.val(rt.doubleTypeLiteral, x.v * x.v),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "pinMode": {
            f: (rt, _this, pin: any, mode: any) => {
                throw new Error(`Function pinMode is not supported in the simulator!`)
            },
            args: [rt.intTypeLiteral, rt.intTypeLiteral],
            return: rt.voidTypeLiteral
        },
        "digitalWrite": {
            f: (rt, _this, pin: any, value: any) => {
                throw new Error(`Function digitalWrite is not supported in the simulator!`)
            },
            args: [rt.intTypeLiteral, rt.intTypeLiteral],
            return: rt.voidTypeLiteral
        },
        "digitalRead": {
            f: (rt, _this, pin: any) => {
                throw new Error(`Function digitalRead is not supported in the simulator!`)
            },
            args: [rt.intTypeLiteral],
            return: rt.intTypeLiteral
        },
        "analogWrite": {
            f: (rt, _this, pin: any, value: any) => {
                throw new Error(`Function analogWrite is not supported in the simulator!`)
            },
            args: [rt.intTypeLiteral, rt.intTypeLiteral],
            return: rt.voidTypeLiteral
        },
        "analogRead": {
            f: (rt, _this, pin: any) => {
                throw new Error(`Function analogRead is not supported in the simulator!`)
            },
            args: [rt.intTypeLiteral],
            return: rt.intTypeLiteral
        },
        "millis": {
            f: (rt, _this) => rt.val(rt.intTypeLiteral, Date.now() - loadTime),
            args: [],
            return: rt.intTypeLiteral
        },
        "micros": {
            f: (rt, _this, pin: any) => {
                rt.val(rt.intTypeLiteral, (Date.now() - loadTime) * 1000)
            },
            args: [],
            return: rt.intTypeLiteral
        },
        "delay": {
            f: async (rt, _this, ms: any) => {
                delay.set(ms.v)
            },
            args: [rt.intTypeLiteral],
            return: rt.voidTypeLiteral
        },
        "delayMicroseconds": {
            f: (rt, _this, us: any) => {
                delay.set(round(us.v / 1000))
            },
            args: [rt.intTypeLiteral],
            return: rt.voidTypeLiteral
        },
        "map": {
            f: (rt, _this, x: any, in_min: any, in_max: any, out_min: any, out_max: any) => {
                return rt.val(rt.doubleTypeLiteral, (x.v - in_min.v) * (out_max.v - out_min.v) / (in_max.v - in_min.v) + out_min.v);
            },
            args: [rt.doubleTypeLiteral, rt.doubleTypeLiteral, rt.doubleTypeLiteral, rt.doubleTypeLiteral, rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
        "random": {
            f: (rt, _this, max: any) => rt.val(rt.doubleTypeLiteral, Math.random() * max.v),
            args: [rt.doubleTypeLiteral],
            return: rt.doubleTypeLiteral
        },
    }
}


export const ArduinoH = {
    // @ts-ignore
    load(rt: CRuntime) {
        loadTime = Date.now();
        // See if abs is defined
        Object.entries(functions(rt)).forEach(([name, f]) => {
            try {
                rt.getFunc("global", name, f.args)
            } catch (e) { // If not found, define it
                rt.regFunc(f.f, "global", name, f.args, f.return);
                addIgnoredVariable(name)
            }
        });

        // Make an instance of the class called enes100
        for (let key in ArduinoDefines) {
            rt.interp.newMacro({type: 'Identifier', val: key, space: ' '}, [{val: String(ArduinoDefines[key]), space: ' ', type: "Seperator"}])
        }
    }
}