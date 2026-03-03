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
<h2>Inconsistencies with Arduino Environment</h2>
<ol>
    <li>An int is 4 bytes, unlike 2 bytes on an Arduino. See <a href="https://github.com/felixhao28/JSCPP/tree/master">here</a>
        for more information on the limits of the integer types.
    </li>
    <li>Arduino functions that manipulate pins obviously do not work. (pinMode, digitalWrite).</li>
    <li>micros and delayMicroseconds are only accurate to the nearest millisecond. (so use millis and delay)</li>
</ol>

<h2>How does this runtime work</h2>
<div>This runtime is interpreting C++ code in the browser. C++ is typically a compiled language but to allow for a better debugging
    experience we are using a runtime. The simulator will first parse your code, then execute it line by line. The parser must be 100%
    successful (which is why a forgotten semicolon will not allow you to run any lines). Then the runtime executes code, like
    assigning and reading variables. If a variable does not exist or is misspelled, the parser will be happy, but the runtime will not,
    and you'll see an error when that line is ran.
</div>

<h2>Supported Libraries</h2>
<div>The runtime is <a href="https://github.com/felixhao28/JSCPP">https://github.com/felixhao28/JSCPP</a>.</div>

<div>
    The following libraries are supported in this runtime. Note: You must include the libraries before including Arduino.h.
</div>
<ul>
    <li>iostream (only cout and endl) (cin will load, but there is not way to input data)</li>
    <li>
        <div>cmath</div>
        <small>many of the math functions are implemented by the Arduino.h library.
            To see which ones are implemented, start an example sketch, click "Show Variables" (if hidden) and
            then "Show Arduino Functions"</small></li>
    <li>cctype</li>
    <li>
        <div>cstring</div>
        <small>strcpy and other related functions.</small>
    </li>
    <li>
        <div>cstdio</div>
        <small>partial implementation. Includes printf, which is not standard in Arduino.</small>
    </li>
    <li><a href="https://enes100.umd.edu/libraries/enes100" target="_blank">Enes100.h</a></li>
    <li><a href="https://enes100.umd.edu/libraries/tank" target="_blank">Tank.h</a></li>
    <li>Most functions and defines in Arduino.h</li>
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