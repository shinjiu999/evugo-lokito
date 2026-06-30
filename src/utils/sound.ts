// Web Audio API Synthesized Sound Engine for Tactigen Playbook Creator
//Programmatic synthesis avoids external assets and network dependencies.

let audioCtx: AudioContext | null = null;
let isMutedState = localStorage.getItem("tactigen_sound_muted") === "true";

// Helper to safely get or initialize the AudioContext
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // If suspended (due to autoplay policies), attempt to resume
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // Ignore errors; user interaction will eventually enable it
    });
  }
  return audioCtx;
}

export const soundManager = {
  getMuted(): boolean {
    return isMutedState;
  },

  setMuted(muted: boolean) {
    isMutedState = muted;
    localStorage.setItem("tactigen_sound_muted", String(muted));
  },

  toggleMuted(): boolean {
    const newVal = !isMutedState;
    this.setMuted(newVal);
    // Play a tiny confirmation beep if unmuted
    if (!newVal) {
      setTimeout(() => {
        this.playClick();
      }, 50);
    }
    return newVal;
  },

  // Dual-frequency referee whistle with realistic vibrato/flutter
  playWhistle() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // We combine two high-pitch oscillators to create the whistle "beat" effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      // Vibrato LFO to modulate frequencies for the whistle "flutter"
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      const mainGain = ctx.createGain();
      const bandpass = ctx.createBiquadFilter();

      // Configure frequencies (classic referee whistle uses ~1000Hz and ~1200Hz)
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1050, now);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1180, now);

      // LFO frequency at 35Hz for rapid "flutter"
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(35, now);
      lfoGain.gain.setValueAtTime(25, now); // Modulate frequency by +/- 25Hz

      // Connect LFO to modulate oscillator frequencies
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Filter to sweeten the sound
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1100, now);
      bandpass.Q.setValueAtTime(3, now);

      // Envelope: sharp attack, fast flutter, short tail
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      mainGain.gain.setValueAtTime(0.08, now + 0.22);
      mainGain.gain.linearRampToValueAtTime(0, now + 0.35);

      // Connect nodes
      osc1.connect(bandpass);
      osc2.connect(bandpass);
      bandpass.connect(mainGain);
      mainGain.connect(ctx.destination);

      // Start & stop all
      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      lfo.stop(now + 0.36);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch (e) {
      console.warn("Whistle synth blocked or error:", e);
    }
  },

  // Heavy kick sound (pitch-sweep sine wave) representing soccer ball kicks / player placement
  playKick() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      // Fast sweep from 140Hz down to 45Hz
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn("Kick synth error:", e);
    }
  },

  // Short clean UI beep for standard clicks
  playClick() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Silent error
    }
  },

  // Ascending cheerful chime for saving, promotions, or successes
  playChime() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440.0, 554.37, 659.25, 880.0]; // A4, C#5, E5, A5 arpeggio
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.07;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } catch (e) {
      // Silent error
    }
  },

  // Descending oscillator sweep for resetting / clearing the board
  playSweep() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.25);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // Silent error
    }
  },

  // White-noise based stadium cheering and applause sound effect
  playCrowdCheer() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 2.5; // 2.5 seconds of sound
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate standard white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Band-pass filter to sound like vocal/crowd resonance
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(1.2, now);

      // Low-pass filter to soften high frequencies
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(1200, now);

      // Add a slow resonance flutter
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(8, now); // 8Hz flutter
      lfoGain.gain.setValueAtTime(200, now); // flutter filter by +/- 200Hz

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Volume envelope: slow build up (swell), long fade out
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.4); // roar swell
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4); // slow dissipate

      noiseNode.connect(filter);
      filter.connect(lpFilter);
      lpFilter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      noiseNode.start(now);

      lfo.stop(now + 2.5);
      noiseNode.stop(now + 2.5);
    } catch (e) {
      console.warn("Crowd cheer error:", e);
    }
  },

  // Programmatic subtle scribble pen scratch sound for drawing
  playScribble() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.08; // extremely short noise burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // High-pass filter to simulate friction of a dry whiteboard marker
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3500, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.08);
    } catch (e) {
      // Silent error
    }
  }
};
