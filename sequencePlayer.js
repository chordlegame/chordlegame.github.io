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
function beatToS(BPM, subdiv){
    let spb = 60.0 / BPM; //seconds per beat
    return spb * subdiv;
}

function beatToMS(BPM, subdiv){

    return beatToS(BPM, subdiv) * 1000.0;
}

const piano = Synth.createInstrument('piano');
const organ = Synth.createInstrument('organ');
const acoustic = Synth.createInstrument('acoustic');
const edm = Synth.createInstrument('edm');

Synth.setSampleRate(41400);

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
    acoustic.play(noteToAudioSynthNote[note % 12], (note / 12), duration);
}

/**
 * @param {sequence} seq 
 */

async function play(seq) {
    let bpm = seq.tempo;
    
    playChords(seq);

    for(let element of seq.notes){
        if(element instanceof Note){
            playNote(element.note, beatToS(bpm, element.duration / 2.0));
            await delay(beatToMS(bpm, element.duration / 2.0));
        }
        else await delay(beatToMS(bpm, element.duration / 2.0));
    }
}

/**
 * @param {sequence} seq 
 */
async function playChords(seq){
    let bpm = seq.tempo;
    console.log(bpm);
    let duration = 0;

    for(let chord of seq.chords){
        if(duration == 0){
            duration = chord.duration/2.0;
            console.log(duration);
        }

        if(chord == null) await delay(beatToMS(bpm, duration));
        else {
            for(var element of chord.notes){
                playNote(element.note + 12, 1)//beatToS(bpm, duration))
            };
            await delay(beatToMS(bpm, duration));
        }   
    }
}