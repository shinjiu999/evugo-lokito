// Web Audio API High-Fidelity Synthesizer Engine for Tactigen Playbook
// Programmatic synthesis avoids external asset files, network lag, and copyright constraints.
// Specially calibrated for professional tactical software: warm haptic clicks,
// authentic referee whistle, leather football impact, lush glass/marimba chimes,
// realistic stadium atmosphere, and dry-erase marker friction.

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let compressorNode: DynamicsCompressorNode | null = null;

let isMutedState = typeof window !== "undefined" && localStorage.getItem("tactigen_sound_muted") === "true";
let masterVolume = typeof window !== "undefined" 
  ? parseFloat(localStorage.getItem("tactigen_sound_volume") || "0.85")
  : 0.85;

if (isNaN(masterVolume) || masterVolume < 0 || masterVolume > 1) {
  masterVolume = 0.85;
}

// Helper to safely get or initialize the AudioContext and Master Bus with soft limiter
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && (!masterGainNode || !compressorNode)) {
    try {
      // Dynamics compressor acts as a transparent master limiter preventing clipping
      compressorNode = audioCtx.createDynamicsCompressor();
      compressorNode.threshold.setValueAtTime(-10, audioCtx.currentTime);
      compressorNode.knee.setValueAtTime(10, audioCtx.currentTime);
      compressorNode.ratio.setValueAtTime(8, audioCtx.currentTime);
      compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressorNode.release.setValueAtTime(0.12, audioCtx.currentTime);

      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime(isMutedState ? 0 : masterVolume, audioCtx.currentTime);

      compressorNode.connect(masterGainNode);
      masterGainNode.connect(audioCtx.destination);
    } catch (e) {
      console.warn("Master bus init warning:", e);
    }
  }

  // If suspended due to browser autoplay policies, attempt to resume
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getDestination(ctx: AudioContext): AudioNode {
  return compressorNode || ctx.destination;
}

export const soundManager = {
  getMuted(): boolean {
    return isMutedState;
  },

  setMuted(muted: boolean) {
    isMutedState = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("tactigen_sound_muted", String(muted));
    }
    const ctx = getAudioContext();
    if (ctx && masterGainNode) {
      const now = ctx.currentTime;
      masterGainNode.gain.cancelScheduledValues(now);
      masterGainNode.gain.setValueAtTime(masterGainNode.gain.value, now);
      masterGainNode.gain.linearRampToValueAtTime(muted ? 0 : masterVolume, now + 0.05);
    }
  },

  toggleMuted(): boolean {
    const newVal = !isMutedState;
    this.setMuted(newVal);
    if (!newVal) {
      setTimeout(() => {
        this.playClick();
      }, 60);
    }
    return newVal;
  },

  getVolume(): number {
    return masterVolume;
  },

  setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    masterVolume = clamped;
    if (typeof window !== "undefined") {
      localStorage.setItem("tactigen_sound_volume", String(clamped));
    }
    const ctx = getAudioContext();
    if (ctx && masterGainNode && !isMutedState) {
      const now = ctx.currentTime;
      masterGainNode.gain.cancelScheduledValues(now);
      masterGainNode.gain.linearRampToValueAtTime(clamped, now + 0.05);
    }
  },

  /**
   * Ultra-clean tactile UI click / haptic tap.
   * Replaces piercing high-frequency beeps with a warm, organic mechanical switch pop.
   */
  playClick() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);

      // 1. Subtle random pitch variation (+/- 4%) so fast repeated clicks sound natural
      const pitchJitter = 1 + (Math.random() * 0.08 - 0.04);
      const baseFreq = 380 * pitchJitter;

      // 2. Warm resonant body (pitch drop from ~380Hz to 140Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.024);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(850, now);

      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.026);

      // 3. Crisp micro-transient (5ms soft pink-noise click for definition)
      const bufferSize = Math.floor(ctx.sampleRate * 0.006);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.035, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      noiseNode.start(now);
      noiseNode.stop(now + 0.007);
    } catch (e) {
      // Silent catch
    }
  },

  /**
   * Authentic Fox 40 Sonik style professional referee whistle.
   * Dual acoustic resonances (~2300Hz and ~2580Hz) + chaotic pea flutter + aerodynamic breath onset.
   */
  playWhistle() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);
      const whistleDuration = 0.32;

      // Dual acoustic fundamental oscillators producing the characteristic referee beat tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const subHarmonic = ctx.createOscillator();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2380, now);
      osc1.frequency.linearRampToValueAtTime(2420, now + 0.06);
      osc1.frequency.linearRampToValueAtTime(2360, now + whistleDuration);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2620, now);
      osc2.frequency.linearRampToValueAtTime(2660, now + 0.06);
      osc2.frequency.linearRampToValueAtTime(2590, now + whistleDuration);

      // Low resonance body to give weight
      subHarmonic.type = "triangle";
      subHarmonic.frequency.setValueAtTime(1200, now);

      // LFO for the internal pea/air turbulence flutter (32Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(32, now);
      lfoGain.gain.setValueAtTime(45, now); // frequency modulation +/- 45Hz

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Air breath noise layer simulating pressurized airflow through the whistle nozzle
      const noiseLen = Math.floor(ctx.sampleRate * (whistleDuration + 0.05));
      const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const noiseData = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      const breathNoise = ctx.createBufferSource();
      breathNoise.buffer = noiseBuf;

      const breathFilter = ctx.createBiquadFilter();
      breathFilter.type = "bandpass";
      breathFilter.frequency.setValueAtTime(2500, now);
      breathFilter.Q.setValueAtTime(3.5, now);

      const breathGain = ctx.createGain();
      breathGain.gain.setValueAtTime(0, now);
      breathGain.gain.linearRampToValueAtTime(0.03, now + 0.02);
      breathGain.gain.setValueAtTime(0.03, now + whistleDuration - 0.05);
      breathGain.gain.exponentialRampToValueAtTime(0.0001, now + whistleDuration);

      breathNoise.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(dest);

      // Master shaping filter to warm up the whistle and prevent harsh piercing
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(2500, now);
      bandpass.Q.setValueAtTime(2.2, now);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.015, now);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, now);
      // Fast acoustic burst attack
      mainGain.gain.linearRampToValueAtTime(0.085, now + 0.025);
      mainGain.gain.setValueAtTime(0.085, now + whistleDuration - 0.06);
      mainGain.gain.linearRampToValueAtTime(0.0001, now + whistleDuration);

      osc1.connect(bandpass);
      osc2.connect(bandpass);
      subHarmonic.connect(subGain);
      subGain.connect(bandpass);
      bandpass.connect(mainGain);
      mainGain.connect(dest);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      subHarmonic.start(now);
      breathNoise.start(now);

      const stopTime = now + whistleDuration + 0.02;
      lfo.stop(stopTime);
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      subHarmonic.stop(stopTime);
      breathNoise.stop(stopTime);
    } catch (e) {
      console.warn("Whistle synth error:", e);
    }
  },

  /**
   * Crisp double-tweet referee whistle (tweet-tweet!).
   * Ideal for signaling quick phase transitions or tactical stops.
   */
  playWhistleDouble() {
    this.playWhistle();
    setTimeout(() => {
      this.playWhistle();
    }, 180);
  },

  /**
   * Heavy authentic leather football kick & tactical board magnetic piece lock.
   * Features a crisp leather impact transient followed by a warm resonant air cavity thump.
   */
  playKick() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);

      // 1. Resonant air-cavity body (pitch sweep 165Hz -> 52Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.08);

      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(260, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.12);

      // 2. Leather boot contact slap (bandpassed transient noise 550Hz)
      const bufferSize = Math.floor(ctx.sampleRate * 0.025);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const slapFilter = ctx.createBiquadFilter();
      slapFilter.type = "bandpass";
      slapFilter.frequency.setValueAtTime(580, now);
      slapFilter.Q.setValueAtTime(1.8, now);

      const slapGain = ctx.createGain();
      slapGain.gain.setValueAtTime(0.065, now);
      slapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

      noise.connect(slapFilter);
      slapFilter.connect(slapGain);
      slapGain.connect(dest);

      noise.start(now);
      noise.stop(now + 0.026);
    } catch (e) {
      console.warn("Kick synth error:", e);
    }
  },

  /**
   * Lush modern pentatonic celesta/marimba chord chime.
   * Replaces 8-bit buzzes with pristine glass-like acoustic harmonics.
   */
  playChime() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);

      // Elegant modern pentatonic chord: D5, G5, A5, D6 (warm, uplifting, polished)
      const chord = [587.33, 783.99, 880.00, 1174.66];

      chord.forEach((freq, idx) => {
        const noteStart = now + idx * 0.045;
        const noteDuration = 0.52;

        // Fundamental note (pure sine)
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        // Overtone harmonic (bell sparkle at 2.76x)
        const overtone = ctx.createOscillator();
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(freq * 2.76, noteStart);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0, noteStart);
        oscGain.gain.linearRampToValueAtTime(0.045, noteStart + 0.012);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0, noteStart);
        overtoneGain.gain.linearRampToValueAtTime(0.012, noteStart + 0.008);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration * 0.5);

        osc.connect(oscGain);
        overtone.connect(overtoneGain);
        oscGain.connect(dest);
        overtoneGain.connect(dest);

        osc.start(noteStart);
        overtone.start(noteStart);

        osc.stop(noteStart + noteDuration + 0.02);
        overtone.stop(noteStart + noteDuration + 0.02);
      });
    } catch (e) {
      // Silent catch
    }
  },

  /**
   * Silky air brush whoosh / magnetic tactical board wipe.
   * Gently sweeps through warm frequencies for clean, non-intrusive reset transitions.
   */
  playSweep() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);
      const sweepDuration = 0.26;

      // 1. Filtered pink-ish noise sweep
      const bufSize = Math.floor(ctx.sampleRate * sweepDuration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1900, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + sweepDuration);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + sweepDuration);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noiseNode.start(now);
      noiseNode.stop(now + sweepDuration + 0.02);

      // 2. Subtle low tone support
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + sweepDuration);

      oscGain.gain.setValueAtTime(0.035, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + sweepDuration);

      osc.connect(oscGain);
      oscGain.connect(dest);

      osc.start(now);
      osc.stop(now + sweepDuration);
    } catch (e) {
      // Silent catch
    }
  },

  /**
   * Stadium crowd cheer & roar with vocal resonance and applause texture.
   * Accurately models the human resonance of a packed stadium celebration.
   */
  playCrowdCheer() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);
      const cheerDuration = 2.6;

      const bufferSize = Math.floor(ctx.sampleRate * cheerDuration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Seed rich white noise buffer
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // 1. Deep rumble & crowd mass resonance (180Hz - 420Hz)
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = "bandpass";
      rumbleFilter.frequency.setValueAtTime(240, now);
      rumbleFilter.Q.setValueAtTime(1.1, now);

      // 2. Vocal human vowel formant filter (~750Hz and ~1350Hz)
      const vocalFilter = ctx.createBiquadFilter();
      vocalFilter.type = "bandpass";
      vocalFilter.frequency.setValueAtTime(760, now);
      vocalFilter.Q.setValueAtTime(1.8, now);

      // Flutter LFO simulating wave of voices
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(4.5, now);
      lfoGain.gain.setValueAtTime(90, now);

      lfo.connect(lfoGain);
      lfoGain.connect(vocalFilter.frequency);

      // Master cheer envelope: energetic build up swell -> sustained ovation -> reverberant decay
      const roarGain = ctx.createGain();
      roarGain.gain.setValueAtTime(0, now);
      roarGain.gain.linearRampToValueAtTime(0.08, now + 0.35); // enthusiastic swell
      roarGain.gain.setValueAtTime(0.08, now + 1.1);
      roarGain.gain.exponentialRampToValueAtTime(0.0001, now + cheerDuration);

      noiseNode.connect(rumbleFilter);
      noiseNode.connect(vocalFilter);
      rumbleFilter.connect(roarGain);
      vocalFilter.connect(roarGain);
      roarGain.connect(dest);

      // 3. Applause crackle layer (simulating thousands of claps)
      const clapNode = ctx.createBufferSource();
      clapNode.buffer = buffer;

      const clapFilter = ctx.createBiquadFilter();
      clapFilter.type = "highpass";
      clapFilter.frequency.setValueAtTime(2200, now);

      const clapGain = ctx.createGain();
      clapGain.gain.setValueAtTime(0, now);
      clapGain.gain.linearRampToValueAtTime(0.025, now + 0.3);
      clapGain.gain.exponentialRampToValueAtTime(0.0001, now + cheerDuration - 0.2);

      clapNode.connect(clapFilter);
      clapFilter.connect(clapGain);
      clapGain.connect(dest);

      lfo.start(now);
      noiseNode.start(now);
      clapNode.start(now);

      const stopTime = now + cheerDuration + 0.05;
      lfo.stop(stopTime);
      noiseNode.stop(stopTime);
      clapNode.stop(stopTime);
    } catch (e) {
      console.warn("Crowd cheer error:", e);
    }
  },

  /**
   * Organic whiteboard dry-erase marker friction for drawing tactical arrows.
   * Replaces abrasive white noise with silky felt-tip marker gliding on glossy board.
   */
  playScribble() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);
      const scribbleDuration = 0.045;

      const bufferSize = Math.floor(ctx.sampleRate * scribbleDuration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Gentle decaying noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Soft felt-tip friction bandpass
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      // Small frequency jitter to keep repetitive strokes natural
      const freq = 1950 + (Math.random() * 300 - 150);
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(2.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + scribbleDuration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(now);
      noise.stop(now + scribbleDuration + 0.005);
    } catch (e) {
      // Silent catch
    }
  },

  /**
   * Quick pleasant micro-haptic pop for switches and secondary chips.
   */
  playPop() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.022);
    } catch (e) {}
  },

  /**
   * Majestic orchestral brass fanfare for Broadcast TV & Champions League view.
   * Harmonically rich brass tones (C4, E4, G4, C5, E5) with warm analog filtering.
   */
  playChampionsAnthem() {
    if (isMutedState) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = getDestination(ctx);
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);

        // Warm brass filter (simulates orchestral French horn / trumpet resonance)
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2200, now + 0.35 + idx * 0.08);
        filter.frequency.exponentialRampToValueAtTime(550, now + 3.2);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.042, now + 0.22 + idx * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(dest);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      console.warn("Champions anthem synth error:", e);
    }
  }
};
