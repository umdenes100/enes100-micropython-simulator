<script lang="ts">
    import {teamName, variables} from "../state.js";
    import {ignored_variables} from "../sim/code";

    let showArduinoFunctions = false;
    let vars: typeof $variables;
    $: vars = showArduinoFunctions ? $variables : $variables.filter(v => !ignored_variables.has(v.name));
</script>

<!--{JSON.stringify($variables)}-->
<input type="button" value={showArduinoFunctions ? 'Hide Arduino functions' : 'Show Arduino functions'}
         on:click={() => showArduinoFunctions = !showArduinoFunctions}/>
{#if showArduinoFunctions}<small>Need another Arduino function? Ask an LTF.</small>
    {:else}
    <small>Team Name: {$teamName ?? ''}</small>
{/if}
<table class="table table-striped table-bordered table-hover">
    <thead>
    <tr>
        <th>Name</th>
        <th>Value</th>
        <th>Type</th>
    </tr>
    </thead>
    <tbody>
    {#each vars as v (v.name)}
        <tr>
<!--            class={lastVarsMap[v.name] == null || lastVarsMap[v.name].value !== v.value || lastVarsMap[v.name].type !== v.type ? "updated-variable-item" : ""}>-->
            <td>{v.name ?? 'unknown'}</td>
            <td>{v.value ?? 'unknown'}</td>
            <td>{v.type ?? 'unknown'}</td>
        </tr>
    {/each}
    </tbody>
</table>
