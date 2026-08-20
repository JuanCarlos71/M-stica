class MysticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // 432Hz fundamental + 528Hz harmonic overtone
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(216, this.ctx.currentTime); // 432 / 2 warm bass

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(432, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      // Subtle LFO for gentle celestial breathing effect
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second breathing cycle
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.masterGain.gain);

      this.osc1.connect(filter);
      this.osc2.connect(filter);
      filter.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio start prevented:', e);
    }
  }

  public stop() {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
      }
      this.isPlaying = false;
    } catch (e) {
      console.warn('Audio stop error:', e);
    }
  }

  public playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(864, this.ctx.currentTime); // High celestial bell
      chimeOsc.frequency.exponentialRampToValueAtTime(108, this.ctx.currentTime + 1.8);

      chimeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 1.9);
    } catch (e) {
      // ignore
    }
  }

  public playBell() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528Hz Solfeggio frequency
      bellOsc.frequency.exponentialRampToValueAtTime(264, this.ctx.currentTime + 1.2);

      bellGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      bellOsc.connect(bellGain);
      bellGain.connect(this.ctx.destination);

      bellOsc.start();
      bellOsc.stop(this.ctx.currentTime + 1.3);
    } catch (e) {
      // ignore
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const mysticAudio = new MysticAudioEngine();
