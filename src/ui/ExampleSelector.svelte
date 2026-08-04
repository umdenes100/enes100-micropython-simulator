<script lang="ts">
    import {basicExample, testExample, turnExample, sensorExample, missionExample, stopExample} from "./examples.js";
    import playSVG from "./buttons/play.svg";
    import Overlay from "./Overlay.svelte";
    import {createEventDispatcher} from "svelte";

    export let setCode: (s: string) => void;
    const dispatch = createEventDispatcher();

    const examples = [
        {name: "Basic Example", description: "Basic example to start driving and the printing location.", code: basicExample},
        {name: "Test Example", description: "Complete example with every single Enes100 function.", code: testExample},
        {name: "Turn Example", description: "Demonstrates differential drive by setting motors to opposite speeds.", code: turnExample},
        {name: "Sensor Example", description: "Uses distance sensor to detect and avoid obstacles.", code: sensorExample},
        {name: "Mission Example", description: "Demonstrates mission transmission for all 6 mission types.", code: missionExample},
        {name: "Stop Example", description: "Demonstrates stopping when reaching a target position.", code: stopExample},
    ]
</script>

<style>

    .example:hover span {
        text-decoration: underline;
    }

    .example span {
        display: flex;
        align-items: center;
    }
</style>

<h1>Select an example</h1>
{#each examples as example}
    <div role='none' on:click={() => setCode(example.code)} class="example">
        <span style="font-size: 24px"><img src={playSVG} alt="">{example.name}</span>
        <p>{example.description}</p>
    </div>
{/each}
