<script lang="ts">
    import helpSVG from "./buttons/help.svg";
    import playSVG from "./buttons/play.svg";
    import speed2SVG from "./buttons/speed2.svg";
    import saveSVG from "./buttons/save.svg";
    import examplesSVG from "./buttons/examples.svg";
    import infoSVG from "./buttons/info.svg";
    import stopSVG from "./buttons/stop.svg";
</script>

<style>
    h1, h2, h3 {
        margin: 5px 0;
        font-weight: lighter;
    }

    h1, .info {
        font-size: 2em;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
    }

    .buttonDesc {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 5px;
    }
</style>

<h1><img src={helpSVG} alt="" style="height: 100%">Simulator Help</h1>

<h2>Layout</h2>
<div>
    The simulator page is divided in half. On the left half is the editor and on the right is the simulation side.
    Drag the white bar in the middle to resize the editor and simulation.
</div>
<h2>Editor</h2>
<div>
    The editor is a simple text editor with syntax highlighting for Python. You
    cannot edit your code once the program has started. The editor automatically saves and
    restores your code whenever you run it / refresh the page.
</div>
<h3>Editor Buttons (Editing)</h3>
<div class='buttonDesc'>
    <button><img src={playSVG} alt=""></button>
    Start your program. Your <code>setup()</code> function runs once, then your <code>loop()</code>
    function runs over and over until you click Stop.
</div>
<div class='buttonDesc'>
    <button><img src={speed2SVG} alt="" style="transform: rotate(90deg)"></button>
    Change how often <code>loop()</code> runs. Slower speeds wait longer between each call to
    <code>loop()</code>, making it easier to follow what your robot is doing.
</div>
<div class='buttonDesc'>
    <button><img src={saveSVG} alt=""></button>
    Save the program. The program is saved to your computer and will be restored when you open the page.
    The program is automatically stored when ran.
</div>
<div class='buttonDesc'>
    <button><img src={examplesSVG} alt=""></button>
    Load an example program. This will overwrite your current program.
</div>
<div class='buttonDesc'>
    <button><img src={infoSVG} alt=""></button>
    Learn about the limitations of the simulator.
</div>
<div class='buttonDesc'>
    <button><img src={helpSVG} alt=""></button>
    See this help page.
</div>
<h3>Editor Buttons (Running)</h3>
<div class="buttonDesc">
    <button><img src={stopSVG} alt=""></button>
    Stop the program and enable editing.
</div>

<h2>Simulation</h2>
<div>
    The simulator has two parts: the simulation visual representation and the console.
    <ul>
        <li>The visual representation is a 4 meter wide by 2 meter tall box. The robot cannot leave the box.</li>
        <li>The simulation runs constantly, even when your code is not running. You can click and drag</li>
        <li>the robot to move it or set the location with the text boxes.</li>
        <li>The output of the program (enes100.print statements) will be displayed in the console below.</li>
    </ul>
    <div class="info" style="font-size: unset"><img src={helpSVG} alt="" style="height: 100%">
        Wondering why your vehicle moves randomly over the rumbles?
    </div>
    In real life, robots move randomly all the time. Especially over the rumble strips you will
    need to assume that the robot will move randomly. This is your reminder!
</div>

<h2>Tips</h2>
<ul>
    <li>Click and drag the robot to move it anywhere on the map, even when your robot is driving!</li>
    <li>Randomize the robot to randomize obstacles and robot location.</li>
    <li>Resetting the robot will go back to the previously randomized location.</li>
</ul>