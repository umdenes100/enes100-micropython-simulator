<script lang="ts">
    import {onMount} from "svelte";
    import {startRender, stopRender} from "../sim/render";
    import {arena, clearObstacles, draggingRobot, output, randomize, resetRobot, robot} from "../state";
    import {stopRobot} from "../sim/simulator";
    import Controls from "./Controls.svelte";
    import {clamp, round} from "../sim/utils";

    let canvas: HTMLCanvasElement;

    let controls = false;

    onMount(() => {
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Could not get 2d context from canvas.')
        } else
            startRender(ctx)
        return stopRender
    })

    function control(e: CustomEvent<{ x: number, y: number }>) {
        robot.update(r => ({...r, w: round(e.detail.x * 2, 2), v: round(e.detail.y, 2)}))
    }

    function startDrag(e: MouseEvent) {
        const startMouse = {x: e.clientX, y: e.clientY}
        const startRobot = {x: $robot.x, y: $robot.y}
        const rect = canvas.getBoundingClientRect()
        const mousemove = (e: MouseEvent) => {
            const delta = {x: startMouse.x - e.clientX, y: e.clientY - startMouse.y}
            const robotDelta = {x: -delta.x / rect.width * $arena.width, y: -delta.y / rect.height * $arena.height}
            robot.update(r => ({
                ...r,
                x: clamp(round(startRobot.x + robotDelta.x, 4), .1, $arena.width - .1),
                y: clamp(round(startRobot.y + robotDelta.y, 4), .1, $arena.height - .1)
            }))
        };
        draggingRobot.set(true)

        function mouseup() {
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
            draggingRobot.set(false)
        }

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }

    let autoscroll = true, elem: HTMLTextAreaElement;
    $: if (autoscroll && $output && elem)
        elem.scrollTop = elem.scrollHeight
</script>

<style>
    * {
        user-select: none;
    }

    #container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 100%;
    }

    canvas {
        width: 100%;
        transform: scaleY(-1);
        /*image-rendering: pixelated;*/
    }

    label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    label input {
        width: 60px;
    }
</style>


{#if controls}
    <div style="position: absolute; top: 0; right: 0; padding: 10px; width: 200px; background: white; z-index: 100; border-bottom-left-radius: 100px">
        <div style="position: absolute; top: 0; right: 0;">
            <button on:click={() => controls = false}>X</button>
        </div>
        <Controls on:control={control}/>
    </div>
{/if}

<div id="container">
    <div style="font-size: 1.17em">Simulation</div>
    <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <!--        <label>-->
        <!--            Show Controls-->
        <!--            <input type="checkbox" bind:checked={controls}>-->
        <!--        </label>-->
        <label>X
            <input type="number" bind:value={$robot.x} step="0.1">
        </label>
        <label>Y
            <input type="number" bind:value={$robot.y} step="0.1">
        </label>
        <label>θ
            <input type="number" bind:value={$robot.angle} step="0.1">
        </label>
        <!--        <label>Robot Speed (m/s)-->
        <!--            <input type="number" bind:value={$robot.v} step="0.1">-->
        <!--        </label>-->
        <!--        <label>Robot Angular Speed (rad/s)-->
        <!--            <input type="number" bind:value={$robot.w} step="0.1">-->
        <!--        </label>-->
        <button on:click={resetRobot}>Reset robot</button>
        <button on:click={stopRobot}>Stop Robot</button>
        <button on:click={randomize}>Randomize</button>
        {#if $arena.obstacles.length}
            <button on:click={clearObstacles}>Remove Obstacles</button>
        {:else}
            <button on:click={randomize}>Add Obstacles</button>
        {/if}
    </div>
    <span>
        </span>
    <canvas bind:this={canvas} on:mousedown={startDrag}></canvas>
    <label title={$output.length > 9995 ? "Autoscroll is automatically enabled when number of characters in output exceeds 10k." : ''}>
        Autoscroll
        <input type="checkbox" bind:checked={autoscroll} disabled={$output.length > 9995}>
    </label>
    <!--suppress HtmlUnknownAttribute -->
    <textarea value={$output.replaceAll('\\n', '\n')} style="flex: 1; font-family: monospace; resize: none" bind:this={elem} readonly/>
</div>