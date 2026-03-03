import {type Writable, writable} from "svelte/store";
import type {Arena, Robot} from "./sim/Types";
import {basicExample} from "./ui/examples";
import {storable} from "./storable";
import {round} from "./sim/utils";

// BIG VARIABLES
export const code: Writable<string> = storable('code', basicExample) // The users code. Don't write to this really.
export const output: Writable<string> = writable('')
export const arena: Writable<Arena> = writable(); // Arena, see Arena type in Types.ts
export const robot: Writable<Robot> = writable(); // robot, updates every time it moves. See Types.ts
export const variables: Writable<{ name: string; type: string; value: string }[]> = writable([]) // All variables. Only opened when paused.
export const delay: Writable<number | undefined> = writable(undefined); // Hack way to do delay to not block the main thread lol.

export const teamName: Writable<string> = writable('') // Team name. Just displayed but we have it for later.
export const teamType: Writable<0 | 1 | 2 | 3 | 4 | 5> = writable(0) //
export const markerId: Writable<number> = writable(0) // Only written to. But if we want it later.

export const clearOutputWhenRun: Writable<boolean> = storable('clearOutputWhenRun', true) // Should we clear the output when we run the program. Currently not settable but here for the future.
export const resetRobotWhenRun: Writable<boolean> = storable('resetRobotWhenRun', true) // Should we reset the robot when we run the program. Currently not settable but here for the future.
export const showVariables: Writable<boolean> = writable(true) // Should we show variables in the table?
export const draggingRobot: Writable<boolean> = writable(false) // Are we currently dragging the robot (disable obstacle physics)

export const robotDimensions = {length: 0.15, width: 0.12} // Change the dims of the robot here.

export let robotStart: { x: 0.55, y: 0.55 | 1.45, angle: number, v: 0, w: 0 } =
    {x: 0.55, y: 0.55, angle: 0, v: 0, w: 0} // The start of the robot. Used for reset.

export function reset() {
    const height = 0.5, width = 0.2;
    arena.set({
        height: 2,
        width: 4,
        obstacles: [
            {width, height, top: .25, left: .8 + .6, collisions: false},
            {width, height, top: .75, left: .8 + .6, collisions: true},
            {width, height, top: 1.25, left: .8 + .6 + .8, collisions: true},
        ]
    });

    robot.set({...robotStart});
}

export function resetRobot() {
    robot.set({...robotStart});
}

export function randomize() {
    // Low spot is 0.55, high
    const high: 0 | 1 = round(Math.random()) as 0 | 1;
    robotStart.y = high * 0.9 + 0.55 as .55 | 1.45;
    robotStart.angle = round(Math.random() * Math.PI - (1-high) * Math.PI,2)
    resetRobot();



    arena.update(arena => {
        const height = 0.5, width = 0.2;
        //Randomly place the obstacles into rows and columns with no more than one obstacle in a row at a time. The rumbles will never be in the same “row” as the OTV starting location.

        // However, rumbles cannot be in the same “column” as the OTV starting location. If high, that is collumn 2, else 0.
        const cols = new Set([0,1,2])
        // rumbleCol is 0 or 1 if high, or 1 or 2 if low.
        const rumbleCol  = round(Math.random()) + (high ? 0 : 1);
        cols.delete(rumbleCol);
        const rumbleRow = round(Math.random());

        // Now that we have determined the rumble location, we can place the other two obstacles.
        const ob1Col = [...cols][0];
        cols.delete(ob1Col!);
        const ob2Col = [...cols][0];

        // Only constraint on the rows is that all three obstacles (including rumbles) cannot be in the same row.
        const ob1Row = round(Math.random());
        let ob2Row;
        if (ob1Row === rumbleRow) {
            // constrained to the other row.
            ob2Row = 1 - ob1Row;
        } else {
            ob2Row = round(Math.random());
        }


        return {
            ...arena,
            obstacles: [
                {width, height, top: .25 + ob1Col * 0.5, left: .8 + .6 + ob1Row * .8, collisions: true},
                {width, height, top: .25 + ob2Col * 0.5, left: .8 + .6 + ob2Row * .8, collisions: true},
                {width, height, top: .25 + rumbleCol * 0.5, left: .8 + .6 + rumbleRow * .8, collisions: false},
            ]
        }
    })
}

export function clearObstacles() {
    arena.update(arena => {
        return {...arena, obstacles: []}
    })
}

reset()