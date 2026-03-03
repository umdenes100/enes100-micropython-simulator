import './app.css'
import App from './App.svelte'
import { initMicroPython } from './sim/code'

const app = new App({
  target: document.getElementById('app')!,
})

// Initialize MicroPython
initMicroPython().catch(err => {
  console.error('Failed to initialize MicroPython:', err);
});

export default app