<script lang="ts">
    import {fly} from "svelte/transition";
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher();
    onMount(() => {
        let keydown = (e: KeyboardEvent) => e.key === 'Escape' && dispatch('close');
        document.body.addEventListener('keydown', keydown);
        return () => document.body.removeEventListener('keydown', keydown);
    })
</script>

<style>
    .blur {
        position: absolute;
        inset: 0;
        backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 20;
        background: rgba(0, 0, 0, 0.28)
    }

    .container {
        background: #414141;
        color: white;
        padding: 50px;
        display: flex;
        flex-direction: column;
        border: 1px solid black;
        border-radius: 25px;
        position: relative;
        overflow: auto;
        min-width: 50%;
        max-width: calc(80% - 50px);
        max-height: calc(80% - 50px);
    }
</style>

<div class="blur">
    <div class="container" transition:fly={{y:-1000}}>
        <slot></slot>
        <button style="position: absolute; top: 25px; right: 25px" on:click={() => dispatch('close')} title="Close">X</button>
    </div>
</div>
