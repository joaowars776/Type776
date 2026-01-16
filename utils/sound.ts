
import { SoundType } from '../types';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

export const playTypingSound = (type: SoundType) => {
    if (type === SoundType.OFF) return;

    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const mainGain = ctx.createGain();
        mainGain.connect(ctx.destination);

        switch (type) {
            case SoundType.KEYBOARD:
            case 'theme' as any: // Fallback/Default
                // Original Soft Click (Mechanical-ish)
                const soft = ctx.createOscillator();
                soft.type = 'sine';
                soft.frequency.setValueAtTime(800, now);
                soft.frequency.exponentialRampToValueAtTime(400, now + 0.03);
                
                const softGain = ctx.createGain();
                softGain.gain.setValueAtTime(0.3, now);
                softGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                
                soft.connect(softGain);
                softGain.connect(mainGain);
                soft.start(now);
                soft.stop(now + 0.03);
                break;

            case SoundType.HIGH_PITCH:
                // New "Agudo" Sound - Crisp, high frequency tick
                const highOsc = ctx.createOscillator();
                highOsc.type = 'sine'; 
                // Higher frequency for "Agudo" feel
                highOsc.frequency.setValueAtTime(1200, now); 
                highOsc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                
                const highGain = ctx.createGain();
                // Slightly lower volume as high pitch penetrates more
                highGain.gain.setValueAtTime(0.15, now);
                // Very fast decay for a "tick" sound
                highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                highOsc.connect(highGain);
                highGain.connect(mainGain);
                
                highOsc.start(now);
                highOsc.stop(now + 0.05);
                break;
        }

    } catch (e) {
        // Ignore audio errors silently
    }
};
