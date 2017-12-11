import {backgroundMusic, collectSound, crashSound, endMusic, introMusic} from "./Assets";

const audioContext = new AudioContext();

const gainNode = audioContext.createGain();
gainNode.gain.value = 0.25;
gainNode.connect(audioContext.destination);

let backgroundMusicSource: AudioBufferSourceNode;
let introMusicSource: AudioBufferSourceNode;
let creditsMusicSource: AudioBufferSourceNode;

let crashEffect: AudioBuffer;
let collectEffect: AudioBuffer;

async function convertMp3(mp3: ArrayBuffer): Promise<AudioBufferSourceNode> {
    return new Promise<AudioBufferSourceNode>((resolve) => {
        audioContext.decodeAudioData(mp3, buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);

            resolve(source);
        });
    });
}

async function loadBuffer(buffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>(resolve => {
        audioContext.decodeAudioData(buffer, buffer => {
            resolve(buffer);
        });
    });
}

export async function loadMusic() {
    return Promise.all([
        convertMp3(backgroundMusic),
        convertMp3(introMusic),
        convertMp3(endMusic),
        loadBuffer(crashSound),
        loadBuffer(collectSound)
    ]).then(([background, intro, end, crash, collect]) => {
        backgroundMusicSource = background;
        introMusicSource = intro;
        creditsMusicSource = end;
        crashEffect = crash;
        collectEffect = collect;
    });
}

export function startBackgroundMusic() {
    backgroundMusicSource.start(0);
}

export function stopBackgroundMusic() {
    backgroundMusicSource.stop(0);
}

export function startIntroMusic() {
    introMusicSource.start(0);
}

export function stopIntroMusic() {
    introMusicSource.stop(0);
}

export function startCreditsMusic() {
    creditsMusicSource.start(0);
}

export function stopCreditsMusic() {
    creditsMusicSource.stop(0);
}

export function playCrashEffect() {
    const source = audioContext.createBufferSource();
    source.buffer = crashEffect;
    source.connect(gainNode);
    source.start(0);
}

export function playCollectEffect() {
    const source = audioContext.createBufferSource();
    source.buffer = collectEffect;
    source.connect(gainNode);
    source.start(0);
}

export function startCarSound() {
}

export function stopCarSound() {
}