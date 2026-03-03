<script lang="ts">
    import settingsSVG from "./buttons/settings.svg";
    import {clearOutputWhenRun, resetRobotWhenRun} from "../state";
</script>

<style>
    h1 {
        margin: 5px 0;
        font-weight: lighter;
        font-size: 2em;
        display: flex;
        align-items: center;
        gap: 5px;
    }
</style>

<h1><img src={settingsSVG} alt="" style="height: 100%">Simulator Settings</h1>

<label>
    <input type="checkbox" bind:checked={$clearOutputWhenRun}>
    Clear program output when starting a program
</label>

<label>
    <input type="checkbox" bind:checked={$resetRobotWhenRun}>
    Stop and reset a robot when moving a robot
</label>