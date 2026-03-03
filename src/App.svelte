<script lang="ts">
    import Editor from "./ui/Editor.svelte";
    import Simulator from "./ui/Simulator.svelte";
    import {storable} from "./storable";



    const simulationWidth = storable<number>("simulationWidth", 50);
    $: $simulationWidth = Math.max(5, Math.min(95, $simulationWidth));

    let startX = 0;
    let startWidth = 0;

    function startDrag(e: MouseEvent) {
        startX = e.clientX;
        startWidth = $simulationWidth;
        const mousemove = (e: MouseEvent) => {
            $simulationWidth = Math.max(5, Math.min(95, startWidth + (e.clientX - startX) / window.innerWidth * 100));
        };
        function mouseup() {
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }



</script>

<style>
    #outer {
        display: flex;
        height: 100vh;
    }

    #outer > div {
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
        padding: 5px;
    }

</style>

<!-- If the simulation is edit mode, just show the editor. -->

<div id="outer">
    <div style="width: calc({$simulationWidth}% - 3px);">
        <Editor width={$simulationWidth}/>
    </div>
    <div style="width: 6px; background: #40484f; cursor: col-resize;" on:mousedown={startDrag} role="none">
    </div>
    <div style="width: calc({100 - $simulationWidth}% - 3px)">
        <Simulator/>
    </div>
</div>