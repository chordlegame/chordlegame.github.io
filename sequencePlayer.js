//@ts-check

//import {sequence} from "./sequence"

/**
 * @param {number} milisec 
 * @returns
 */

function delay(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}

/**
 * @param {number} BPM
 * @param {number} subdiv
 * @returns {number}
 */
function beatToMS(BPM, subdiv){
    let spb = 60.0 / BPM; //seconds per beat
    return spb * subdiv * 1000.0;
}

const piano = Synth.createInstrument('piano');
const organ = Synth.createInstrument('organ');
const acoustic = Synth.createInstrument('acoustic');
const edm = Synth.createInstrument('edm');

Synth.setSampleRate(44100);

const noteToAudioSynthNote = {
    0: "C",
    1: "C#",
    2: "D",
    3: "D#",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "G#",
    9: "A",
    10: "A#",
    11: "B"
};

/**
 * @param {number} note 
 * @param {number} duration 
 */
//duration is in seconds
function playNote(note, duration){
    piano.play(noteToAudioSynthNote[note % 12], note / 12, duration);
}

/**
 * @param {sequence} seq 
 */

async function play(seq) {
    let bpm = seq.tempo;
    console.log("bpm: " + bpm);

    for(let element of seq.notes){
        if(element instanceof Note){
            playNote(element.note, element.duration);
            await delay(beatToMS(bpm, element.duration / 2.0));
        }
        else await delay(beatToMS(bpm, element.duration / 2.0));
    }
}