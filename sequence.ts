const VF = Vex.Flow;
type sNote = Vex.Flow.StaveNote;
type sTuple = Vex.Flow.Tuplet;

const durationStrings = {
    1: "8",
    2: "q",
    3: "qd",
    4: "h",
    6: "hd",
    8: "w"
};

const noteStrings = {
    0: "c",
    1: "c#",
    2: "d",
    3: "eb",
    4: "e",
    5: "f",
    6: "f#",
    7: "g",
    8: "ab",
    9: "a",
    10: "bb",
    11: "b"
}

const noteNumbers = {
    "c" : 0,
    "d" : 2,
    "e" : 4,
    "f" : 5,
    "g" : 7,
    "a" : 9,
    "b" : 11,
}

const toneDurationStrings = {
    1: "8n",
    2: "4n",
    3: "4n.",
    4: "2n",
    6: "2n.",
    8: "1n"
}

function toToneTimeString(time : number) : string {
    let measure = Math.floor(time / 8);
    let quarter = Math.floor((time % 8) / 2);
    let eighth = (time % 2) * 2;

    return measure + ":" + quarter + ":" + eighth;
}

class ChordType {
    suffixes : string[];
    notes : number[];

    constructor(suffixstring : string, notestring : string){
        this.suffixes = suffixstring.replace(" ", "").split(",");
        this.notes = notestring.replace(" ", "").split(",").map(x => +x);
    }
}

const chordTypes : ChordType[] = [
    new ChordType("5",          "0,7"),
    new ChordType(",M",         "0,4,7"),
    new ChordType("-,m",        "0,3,7"),
    new ChordType("o,dim",      "0,3,6"),
    new ChordType("+,aug",      "0,4,8"),
    new ChordType("6",          "0,4,7,9"),
    new ChordType("m6,-6",      "0,3,7,9"),
    new ChordType("7",          "0,4,7,10"),
    new ChordType("M7,maj7",    "0,4,7,11"),
    new ChordType("m7,-7,mi7",  "0,3,7,10"),
    new ChordType("o7,dim7",    "0,3,6,9"),
    new ChordType("o/7,hd7",    "0,3,6,10"),
    new ChordType("9",          "0,4,7,10,14"),
    new ChordType("M9,maj9",    "0,4,7,11,14"),
    new ChordType("mi9,-9,m9",  "0,3,7,10,14"),
    new ChordType("6/9,69",     "0,4,7,9,14"),
]

//returns the note + the offset when the note ends
function extractNote(input : string) : [number, number] {
    let note = noteNumbers[input.charAt(0).toLowerCase()];
    let offset = 2;

    if(input.charAt(1) == 's' || input.charAt(1) == '#') note++;
    else if (input.charAt(1) == 'b') note--;
    else offset = 1;

    //console.log(input + ", note: " + note + ", offset: " + offset + ", charAt: " + input.charAt(1))

    return [note, offset];
}

class Chord{
    duration: number;
    notes : Note[]
    name;

    constructor(inputstr : string, duration : number){
        this.name = inputstr;
        this.duration = duration;

        let [root, charoffset] = extractNote(inputstr);

        //console.log(charoffset);

        root += 12 * 2;

        //console.log(root);
        
        chordTypes.forEach(e => {
            e.suffixes.forEach(suffix => {
                if(inputstr.substring(charoffset) === suffix){
                    this.notes = e.notes.map(e => new Note(e + root, duration));
                    this.notes.forEach(n => console.log(n));
                    return;
                }
            });
        });
    }

    toChordSymbol() : Vex.Flow.Annotation {
        let an = new VF.Annotation(this.name);
        return an;
    }

    toToneString(chordNumber) : [string[], string] {
        let notes : string[] = this.notes.map(note => noteStrings[note.note % 12] + (Math.floor(note.note/12) + 1));

        return [notes, toToneTimeString(chordNumber * this.duration)]
    }
}

function sequenceFromFile(sequences : string, index : number = 0) {
    let inputstrings : string[] = sequences.split(";");
    //console.log(inputstrings[0])
    let seq = sequenceFromString(inputstrings[index]);
    return seq;
}

function sequenceFromString(seqString : string) : sequence {
    let lines : string[] = seqString.split("\n");
    let seq : sequence = new sequence(0, 0);
    for(var line of lines){
        let tokens : string[] = line.split(" ");
        switch(tokens[0].toLowerCase()){
            case "swing":
                seq.swing = /^\s*(true|1|on)\s*$/i.test(tokens[1]);
                break;
            case "tempo":
                seq.tempo = +tokens[1];
                break;
            case "timesignature":
                seq.beatsPerMeasure = +tokens[1];
                break;
            case "chords":
                seq.measures = tokens.length - 2;
                for(var chord of tokens.slice(2)){
                    switch(chord){
                        case '-': seq.chords.push(null); break;
                        case '#': seq.pushChord(seq.chords[seq.chords.length - 1].name, +tokens[1]); break;     
                        default: seq.pushChord(chord, +tokens[1]); break;
                    }
                }
                break;
            case "melody":
                processMelody(tokens.splice(1), seq);
                break;
        }
    }

    return seq;
}

function processMelody(tokens : string[], seq : sequence) {
    for(let index = 0; index < tokens.length; index++){
        let notestr : string = tokens[index];
        let duration = 1;

        while(tokens[index + 1] === '#') {
            duration++;
            index++;
        }

        if(notestr === '-') {
            seq.pushRest(duration);
        }
        else {
            let [notenum, charoffset] = extractNote(notestr);
            let octave : number = +notestr.substring(charoffset);
            seq.pushNote(notenum + (octave * 12), duration);
        }
    }
}

export class sequence{
    notes : StaffElement[];
    measures : number;
    beatsPerMeasure : number;
    chords : Chord[];

    swing : boolean;
    tempo : number;

    constructor(measures : number, beatsPerMeasure : number){
        this.measures = measures;
        this.beatsPerMeasure = beatsPerMeasure;
        this.notes = [];
        this.chords = [];
    }

    pushNote(notenumber: number, duration: number){
        this.notes.push(new Note(notenumber, duration))
        return this;
    }

    pushRest(duration: number){
        this.notes.push(new Rest(duration));
        return this;
    }

    pushTuple(note0: number, note1: number, note2: number, duration: number){
        this.notes.push(new Triplet(note0, note1, note2, duration))
        return this;
    }

    deleteLast(){
        return this.notes.pop().duration;
    }

    pushChord(chord : string, duration : number){
        //console.log(chord + "," + duration)
        this.chords.push(new Chord(chord, duration));
    }

    /*
    colors:
    0: grey
    1: green
    2: light yellow
    3: dark yellow
    */
    //returns an array of integers analagous to the object being enacted upon, win
    compare(comparor : sequence) : [number[], boolean] {
        let arr : number[] = [];
        let eigthPointer = 0;
        let win : boolean = true;
        if (comparor.notes.length != this.notes.length) win = false;

        for(var note of this.notes){
            let [element, beat] = comparor.getElementAt8thNoteBeat(eigthPointer);
            //console.log(beat + ", " + eigthPointer);
            if(beat == eigthPointer){
                if(typeof element != typeof note) {
                    //console.log("different element at beat" + beat);
                    if(note instanceof Triplet) arr.push(0, 0, 0);
                    else arr.push(0);
                    win = false;
                }
                else if(element instanceof Note){
                    
                        let extranotes = false;
                        for(let i = beat + 1; i < beat + note.duration; i++){
                            let [h, j] = comparor.getElementAt8thNoteBeat(i);
                            if(h != element){
                                extranotes = true;
                            }
                        }

                        if(extranotes){
                            arr.push(3);
                            win = false;
                        }
                        else if(element.note == (note as Note).note) 
                            arr.push(1);
                        else {
                            arr.push(2);
                            win = false;
                        
                    }
                }
                else if (element instanceof Rest){
                    arr.push(0);
                }
                else if (element instanceof Triplet){
                    if(element.duration != note.duration){
                        arr.push(0,0,0);
                    }
                }
            }
            else{
                if(note instanceof Triplet) arr.push(0, 0, 0);
                else arr.push(0);
                win = false;
            }

            eigthPointer += note.duration;
        }

        return [arr, win];
    }

    getElementAt8thNoteBeat(beat : number) : [StaffElement, number] {
        let eigthPointer = 0;
        let beatofnote = 0;

        for(var note of this.notes) {
            eigthPointer += note.duration;

            if(eigthPointer > beat){
                return [note, beatofnote];
            }

            beatofnote = eigthPointer;
        }

        return [null, eigthPointer];
    }

    toToneArray() {
        let notes = [];

        let eigthPointer = 0;
        for(let n of this.notes){
            if(n instanceof Rest) {}
            else if(n instanceof Note) {
                let start : string = toToneTimeString(eigthPointer);
                let note : string = noteStrings[n.note % 12] + (Math.floor(n.note/12) + 1);
                let obj = {time: start, note: note, duration: n.duration};
                //console.log(obj);
                notes.push(obj);
            }
            else if(n instanceof Triplet) {
                
            }

            eigthPointer += n.duration;
        }

        return notes;
    }
}

class StaffElement {
    duration: number;
    constructor(duration: number){
        this.duration = duration;
    }
}

class Note extends StaffElement {
    note: number;

    constructor(note: number, duration: number){
        super(duration);
        this.note = note;
    }

    toVFNote(triplet : boolean = false) : sNote {
        let noteName : string = noteStrings[this.note % 12] + "/" + Math.floor(this.note/12).toString();
        let duration : string = durationStrings[this.duration];
        let stavenote = new VF.StaveNote({clef: "treble", keys: [noteName], duration: duration });
        if(noteName.length > 1){
            if(noteName.charAt(1) == '#') stavenote.addAccidental(0, new VF.Accidental("#"));
            if(noteName.charAt(1) == 'b') stavenote.addAccidental(0, new VF.Accidental("b"));
        }
        if(duration.length > 1) stavenote.addDot(0);
        stavenote.autoStem();
        return stavenote;
    }
}

class Triplet extends StaffElement {
    note0 : Note;
    note1 : Note;
    note2 : Note;

    constructor(note0: number, note1 : number, note2: number, duration: number){
        super(duration*2);
        this.note0 = new Note(note0, duration);
        this.note1 = new Note(note1, duration);
        this.note2 = new Note(note2, duration);        
    }

    toVFNotes() : [sTuple, sNote[]] {
        let arr = [this.note0.toVFNote(),this.note1.toVFNote(),this.note2.toVFNote()];
        return [new VF.Tuplet(arr), arr];
    }
}

class Rest extends StaffElement {
    constructor(duration: number){super(duration)}

    toVFRest() : sNote{
        return new VF.StaveNote({clef: "treble", keys: ["b/4"], duration: durationStrings[this.duration] + "r"});
    }
}