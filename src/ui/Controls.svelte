<script lang="ts">
    import {spring} from 'svelte/motion';
    import {createEventDispatcher} from 'svelte';
    import {round} from "../sim/utils";

    const dispatch = createEventDispatcher<{ control: { x: number, y: number } }>();

    let coords = spring({x: 0, y: 0}, {
        stiffness: 0.1,
        damping: .5
    });

    // Find your root SVG element
    let svg: SVGSVGElement, pt: DOMPoint, cursorPoint: (e: MouseEvent) => Point;
    type Point = { x: number, y: number };
    function limit({x, y}: Point): Point {
        if (Math.hypot(x, y) <= .9)
            return {x, y}
        else {
            const radians = Math.atan2(y, x)
            return {
                x: Math.cos(radians),
                y: Math.sin(radians)
            }
        }
    }

    function startDrag(e: MouseEvent | TouchEvent) {
        pt = svg.createSVGPoint();
        cursorPoint = (evt: MouseEvent | TouchEvent) => {
            let event: { clientX: number, clientY: number };
            event = !('clientX' in evt) ? evt.touches[0] : evt;
            pt.x = event.clientX;
            pt.y = event.clientY;
            const inverse = pt.matrixTransform(svg.getScreenCTM().inverse());
            return {x: inverse.x / 5, y: inverse.y / 5};
        }
        const mousemove = (e: MouseEvent) => {
            //the input in screen space
            let targetLocSS = cursorPoint(e);
            //location in control space
            const loc = limit(targetLocSS)
            coords.set(loc);
            let newVar = {x: -round(loc.x, 2), y: round(-loc.y, 2)};
            dispatch('control', newVar);
        };
        function mouseup() {
            coords.set({x: 0, y: 0}, {soft: true});
            dispatch('control', {x: 0, y: 0});
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }
</script>

<style>
    svg {
        width: 100%;
        height: 100%;
    }

    .static {
        fill: rgba(211, 211, 211, 0.6);
        stroke: grey;
        stroke-width: 2%
    }

    .draggable {
        cursor: pointer;
        fill: #3c3c3d;
    }
</style>

<div>
<!--         on:mousemove={drag} on:mouseup={end} on:touchmove={drag}-->
<!--         on:touchend={end} on:touchcancel={end} -->
    <svg viewBox="-6 -6 12 12"
         bind:this={svg} role="none">
        <circle cx="0" cy="0" r="{5}" class="static"></circle>
        <circle cx="0" cy="0" r=".9" fill="#3c3c3d" opacity=".7"></circle>
        <circle cx="{($coords.x * 5) ?? 0}" cy="{($coords.y * 5) ?? 0}" r="1.2" class="draggable"
                on:mousedown={startDrag} on:touchstart={startDrag} role="none"
        />
    </svg>
</div>