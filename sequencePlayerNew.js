//@ts-check

const pianoSynth = new Tone.Sampler({
	urls: {
		A0: "A0.mp3",
		C1: "C1.mp3",
		"D#1": "Ds1.mp3",
		"F#1": "Fs1.mp3",
		A1: "A1.mp3",
		C2: "C2.mp3",
		"D#2": "Ds2.mp3",
		"F#2": "Fs2.mp3",
		A2: "A2.mp3",
		C3: "C3.mp3",
		"D#3": "Ds3.mp3",
		"F#3": "Fs3.mp3",
		A3: "A3.mp3",
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
		C5: "C5.mp3",
		"D#5": "Ds5.mp3",
		"F#5": "Fs5.mp3",
		A5: "A5.mp3",
		C6: "C6.mp3",
		"D#6": "Ds6.mp3",
		"F#6": "Fs6.mp3",
		A6: "A6.mp3",
		C7: "C7.mp3",
		"D#7": "Ds7.mp3",
		"F#7": "Fs7.mp3",
		A7: "A7.mp3",
		C8: "C8.mp3"
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();

var audioContextStarted = false;

function checkStartAudioContext(){
	if(!audioContextStarted){
		Tone.start();

		audioContextStarted = true;
		return true;
	}
	return false;
}

let toneMelody = null;
let toneChords = [];

function playToneTest(sequence, mutePart = false){
	Tone.Transport.clear();
	Tone.Transport.stop();
	Tone.Transport.seconds = 0;

	if(checkStartAudioContext()){
		let notes = sequence.toToneArray();

		const part = new Tone.Part(function(time, obj){
			pianoSynth.triggerAttackRelease(obj.note, obj.duration, time);
		}, notes).start(0);

		toneMelody = part;

		let index = 0;
		for(let chord of sequence.chords){
			let [notes, start] = chord.toToneString(index);

			console.log(notes.toString() + ", " + start)

			const chordEvent = new Tone.ToneEvent(function(time, chord){
				pianoSynth.triggerAttackRelease(chord, "1m", time);
			}, notes);

			chordEvent.start(start);

			toneChords.push(chordEvent);

			index++;
		}
	}

	toneMelody.mute = mutePart;

	Tone.Transport.bpm.value = sequence.tempo;

	Tone.Transport.setLoopPoints(0, sequence.measures + "m");
	Tone.Transport.loop = false;

    Tone.Transport.start();
}