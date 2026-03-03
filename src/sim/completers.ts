// noinspection JSUnusedGlobalSymbols
import {Ace} from "ace-builds";
import {Enes100Defines} from "./libs/Enes100.h";
import {ArduinoDefines} from "./libs/Arduino.h";
import {ignored_variables} from "./code";

export class StaticWordCompleter implements Ace.Completer {
    getCompletions(editor: Ace.Editor, session: Ace.EditSession, pos: Ace.Point, prefix: string, callback: Ace.CompleterCallback) {
        const line = session.getLine(pos.row)
        const wordList: { caption: string, value: string, meta: string }[] = [];
        if (line.includes('Tank.')) {
            // return only tank functions.
            wordList.push(...[
                {caption: 'begin', value: 'begin()', meta: '() => (void) start tank library'},
                {caption: 'turnOffMotors', value: 'turnOffMotors()', meta: '() => (void)'},
                {caption: 'setLeftMotorPWM', value: 'setLeftMotorPWM(', meta: '(int) => (void) pwm (-255 to 255)'},
                {caption: 'setRightMotorPWM', value: 'setRightMotorPWM(', meta: '(int) => (void) pwm (-255 to 255)'},
                {caption: 'readDistanceSensor', value: 'readDistanceSensor(', meta: '(int) => (float) (meters)'},
                {caption: 'readBumpSensor', value: 'readBumpSensor(', meta: '(int) => (boolean)'},
            ].map(word => ({...word, score: 1000})))
        } else if (line.includes('Enes100.')) {
            // return only enes100 functions.
            wordList.push(...[
                {caption: 'begin', value: 'begin(', meta: '(see docs) => (void)'},
                {caption: 'getX', value: 'getX()', meta: '() => (number)'},
                {caption: 'getY', value: 'getY()', meta: '() => (number)'},
                {caption: 'getTheta', value: 'getTheta()', meta: '() => (number)'},
                {caption: 'isVisible', value: 'isVisible()', meta: '() => (boolean)'},
                {caption: 'isConnected', value: 'isConnected()', meta: '() => (boolean)'},
                {caption: 'print', value: 'print(', meta: '(any) => (void)'},
                {caption: 'println', value: 'println(', meta: '(any) => (void)'},
                {caption: 'mission', value: 'mission(', meta: '(number, number) => (void)'},
            ].map(word => ({...word, score: 1000})))
        }
        // return everything else.
        Object.keys(Enes100Defines).forEach(word => wordList.push({
            caption: word,
            value: word,
            meta: String(Enes100Defines[word])
        }))
        ignored_variables.forEach(word => wordList.push({
            caption: word,
            value: word,
            meta: "Arduino"
        }))
        Object.keys(ArduinoDefines).forEach(word => wordList.push({
            value: word,
            caption: word,
            meta: String(ArduinoDefines[word])
        }))

        callback(null, wordList);
    }
}

export const completer = new StaticWordCompleter();