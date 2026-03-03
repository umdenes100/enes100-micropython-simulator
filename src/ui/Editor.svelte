<script lang="ts">
    import '../sim/code'
    import {session, startCode} from "../sim/code";
    import {onMount, tick} from "svelte";
    import * as ace from 'ace-builds/src-noconflict/ace';
    import {Ace, Range} from "ace-builds";
    import 'ace-builds/src-noconflict/mode-c_cpp';
    import 'ace-builds/src-noconflict/theme-monokai';
    import 'ace-builds/src-noconflict/ext-language_tools';
    import {setCompleters, textCompleter} from 'ace-builds/src-noconflict/ext-language_tools';

    import {checkCode} from "../sim/checkCode";
    import {code, showVariables} from "../state";
    import VariablesTable from "./VariablesTable.svelte";
    import stopSVG from "./buttons/stop.svg";
    import continueSVG from "./buttons/resume.svg";
    import pauseSVG from "./buttons/pause.svg";
    import stepSVG from "./buttons/step.svg";
    import showSVG from "./buttons/show.svg";
    import hideSVG from "./buttons/hide.svg";
    import playSVG from "./buttons/play.svg";
    import saveSVG from "./buttons/save.svg";
    import speed1SVG from "./buttons/speed1.svg";
    import speed2SVG from "./buttons/speed2.svg";
    import speed3SVG from "./buttons/speed3.svg";
    import examplesSVG from "./buttons/examples.svg";
    import infoSVG from "./buttons/info.svg";
    import helpSVG from "./buttons/help.svg";
    import settingsSVG from "./buttons/settings.svg";
    import fullscreenSVG from "./buttons/fullscreen.svg";
    import ExampleSelector from "./ExampleSelector.svelte";
    import About from "./About.svelte";
    import Overlay from "./Overlay.svelte";
    import Help from "./Help.svelte";
    import {completer} from "../sim/completers";
    import {storable} from "../storable";
    import Settings from "./Settings.svelte";


    export let width: number;

    let editor: Ace.Editor;
    let interval: number = 50;
    let showExampleSelector = false;
    let showInfo = false;
    let showHelp = false;
    let showSettings = false;

    const resize = () => tick().then(() => editor.resize())

    onMount(() => {
        editor = ace.edit("editor");
        // on ctrl s save
        editor.commands.addCommand({
            name: 'save',
            bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
            exec: () => save(true)
        });
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/python");
        setCompleters([completer, textCompleter])
        let timeout = setInterval(() => save(false), 1000 * 5) // Save every 5 seconds regardless


        editor.setOptions({
            "enableBasicAutocompletion": true,
            "enableLiveAutocompletion": true,
            "useSoftTabs": true,
        })
        // @ts-ignore
        editor.$blockScrolling = Infinity;
        let unsub = session.subscribe((s) => {
            editor.setReadOnly(!!s); // If session, should be readonly.
            editor.container.style.opacity = (s ? 0.5 : 1) + ''
            !s ? resize() : null;
            Object.keys(editor.session.getMarkers(false)).forEach((id) => {
                editor.session.removeMarker(Number(id))
            })
            if (s?.line) {
                editor.session.addMarker(new Range(s.line - 1, 0, s.line - 1, 1), "lineMarker", "fullLine", false)
            }
        })
        let unsub2 = showVariables.subscribe(resize)
        return () => {
            editor.destroy();
            unsub();
            unsub2();
            clearInterval(timeout)
        }
    })

    $: width && editor && editor.resize()

    function setCode(c: string) {
        code.set(c)
        editor.setValue(c)
        showExampleSelector = false;
    }

    let lastSaved = 0;

    function save(showAlert = false) {
        if (Date.now() - lastSaved < 1000) return;
        lastSaved = Date.now();
        code.set(editor.getValue())
        if (showAlert === true) // if you send an event for showAlert, so do not replace with if (showAlert)
            alert('Code saved to your browser. It will be restored when you open this page in the future. Save to an Arduino sketch if this code is important!')
    }

    function run() {
        // @ts-ignore
        const [fixedCode, success] = checkCode(editor.getValue());
        // console.log(success, fixedCode)
        code.set(fixedCode);
        editor.setValue(fixedCode)
        if (!success) return;

        startCode(`
${fixedCode}
int main() {
    setup();
    while(1) {
        loop();
    }
    return 0;
}`, interval)
        resize();
    }

    let intervalIndex = storable('Editor.intervalIndex', 2);
    $: interval = [100, 50, 1][$intervalIndex]
</script>

<style>
    #container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 100%;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.lineMarker) {
        position: absolute;
        background: rgba(100, 200, 100, 0.5);
        z-index: 20
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
    }
</style>

<div id="container">
    <div style="font-size: 1.17em">Code Editor</div>
    <div style="display: flex; gap: 10px; margin-left: 2px">
        {#if $session}
            <button on:click={() => {$session?.stop(); resize()}} title="Stop session / edit code">
                <img src={stopSVG} alt=""></button>
            <button on:click={$session.continue} title="Continue code" disabled={$session.running}>
                <img src={continueSVG} alt=""></button>
            <button on:click={$session.pause} title="Pause code {!$session.running ? '(only available once continued)' : ''}" disabled={!$session.running}>
                <img src={pauseSVG} alt=""></button>
            <button on:click={$session.step} title="Run next line" disabled={$session.running}>
                <img src={stepSVG} alt=""></button>
            <button on:click={() => showVariables.update((v) => !v)}
                    title={$showVariables ? 'Hide Variables' : 'Show Variables'}>
                <img src={$showVariables ? hideSVG : showSVG} alt=""></button>
        {:else}
            <button on:click={run} title="Run code">
                <img src={playSVG} alt=""></button>
            <button on:click={() => $intervalIndex = ($intervalIndex+1) % 3}
                    title={['slow', 'normal', 'instant'][$intervalIndex] + ' code execution speed'}>
                <img src={[speed1SVG, speed2SVG, speed3SVG][$intervalIndex]} alt={['slow', 'normal', 'fast'][$intervalIndex]}
                     style="transform: rotate(90deg)">
            </button>
            <button on:click={() => save(true)} title="Save code to browser. (automatically saved every 5s)">
                <img src={saveSVG} alt=""></button>
            <button on:click={() => showExampleSelector = true} title="Load an example">
                <img src={examplesSVG} alt=""></button>
            <button on:click={() => showInfo = true} title="Learn about limitations of the simulator">
                <img src={infoSVG} alt=""></button>
            <button on:click={() => showHelp = true} title="Get help with using the simulator">
                <img src={helpSVG} alt=""></button>
            <button on:click={() => showSettings = true} title="Change simulator settings">
                <img src={settingsSVG} alt=""></button>
            {#if window.self !== window.top}
                <button title="Open fullscreen in a new tab" on:click={() => window.open("https://umdenes100.github.io/enes100-simulator/")}><img src={fullscreenSVG} alt=""></button>
            {/if}
        {/if}
    </div>
    <div id="editor" style="flex: 1">{$code}</div>
    {#if $showVariables && $session}
        <div style="flex: 1; overflow: auto">
            <VariablesTable/>
        </div>
    {/if}
</div>

{#if showExampleSelector}
    <Overlay on:close={() => showExampleSelector = false}>
        <ExampleSelector {setCode}/>
    </Overlay>
{/if}

{#if showInfo}
    <Overlay on:close={() => showInfo = false}>
        <About/>
    </Overlay>
{/if}

{#if showHelp}
    <Overlay on:close={() => showHelp = false}>
        <Help/>
    </Overlay>
{/if}

{#if showSettings}
    <Overlay on:close={() => showSettings = false}>
        <Settings/>
    </Overlay>
{/if}