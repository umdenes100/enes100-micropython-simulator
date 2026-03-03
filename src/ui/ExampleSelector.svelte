<script lang="ts">
    import {basicExample, testExample} from "./examples.js";
    import playSVG from "./buttons/play.svg";
    import Overlay from "./Overlay.svelte";
    import {createEventDispatcher} from "svelte";

    export let setCode: (s: string) => void;
    const dispatch = createEventDispatcher();

    const examples = [
        {name: "Basic Example", description: "Basic example to start driving and the printing location.", code: basicExample},
        {name: "Test Example", description: "Complete example with every single Enes100 function.", code: testExample},
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
