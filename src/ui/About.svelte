<script lang="ts">
    import infoSVG from "./buttons/info.svg";
    import helpSVG from "./buttons/help.svg";
</script>

<style>
    h1, h2 {
        margin: 5px 0;
        font-weight: lighter;
    }

    h1 {
        font-size: 2em;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    a {
        display: inline;
    }
</style>

<h1><img src={infoSVG} alt="" style="height: 100%">About this runtime</h1>
<small style="display: flex; align-items: center; gap: 5px">For help please click on the <img src={helpSVG} alt=""> button on the main page.</small>
<h2>Known Limitations</h2>
<ol>
    <li>Unlike real hardware, this simulator has no physical pins -- there is no <code>machine.Pin</code>,
        no GPIO, and nothing to read or write real voltages. Use the <code>tank</code> and <code>enes100</code>
        objects to control and sense the simulated robot instead.
    </li>
    <li>There is currently no step-by-step debugger. You cannot pause mid-program, single-step through
        lines, or inspect a live variables table while a program is running -- your program simply runs
        from start to finish (<code>setup()</code> once, then <code>loop()</code> repeatedly) once you click Run.
    </li>
    <li>Python integers do not overflow the way C++ integers do -- you generally don't need to worry about
        running out of range on whole numbers.</li>
</ol>

<h2>How does this runtime work</h2>
<div>This runtime runs real Python using MicroPython, compiled to WebAssembly so it can run directly in your browser --
    there is no server involved. Your code must define two functions: <code>setup()</code>, which runs once when you click
    Run, and <code>loop()</code>, which then runs over and over until you click Stop. Errors (like a typo in a variable
    name, or a missing colon) are reported by the real Python interpreter, using normal Python error messages.
</div>

<h2>Supported Libraries</h2>
<div>The runtime is <a href="https://github.com/micropython/micropython" target="_blank">MicroPython</a>,
    run in the browser via its official WebAssembly build.
</div>

<div>
    The following are available in your code. Nothing needs to be imported to use <code>tank</code> or
    <code>enes100</code> -- they're ready to use as soon as your program starts.
</div>
<ul>
    <li>
        <div><code>enes100</code></div>
        <small>The course-specific object for vision system positioning and WiFi communication -- see
            <a href="https://enes100.umd.edu/libraries/enes100" target="_blank">the Enes100 library docs</a>
            for the underlying real-hardware API this mirrors.</small>
    </li>
    <li>
        <div><code>tank</code></div>
        <small>The course-specific object for motor control and sensors -- see
            <a href="https://enes100.umd.edu/libraries/tank" target="_blank">the Tank library docs</a>
            for the underlying real-hardware API this mirrors.</small>
    </li>
    <li>
        <div><code>time.sleep(seconds)</code> and <code>time.sleep_ms(milliseconds)</code></div>
        <small>Pause your program without freezing the simulator. These work inside <code>setup()</code>,
            <code>loop()</code>, and any function you write yourself.</small>
    </li>
    <li>
        <div>Standard MicroPython modules</div>
        <small>including <code>math</code> and <code>random</code>. Regular Python built-ins
            (<code>print</code>, <code>range</code>, <code>len</code>, etc.) all work as expected.</small>
    </li>
</ul>

<div>
    Created by the ENES100 Teaching team, including:
    <ul>
        <li>Forrest Milner (Initial codebase)</li>
        <li>and everyone else who will eventually maintain this project (add your name below when you dev)</li>
    </ul>
    <small>Interested in developing these kind of things an others? As your TA about
        becoming an LTF! We need your skills and enthusiasm.</small>
    <!--  Future developers, add your name here! Take credit!  -->
</div>