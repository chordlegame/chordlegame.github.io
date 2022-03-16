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

export class sequence{
    notes : StaffElement[];
    measures : number;
    beatsPerMeasure : number;

    constructor(measures : number, beatsPerMeasure : number){
        this.measures = measures;
        this.beatsPerMeasure = beatsPerMeasure;
        this.notes = [];
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
        let win  : boolean = true;

        for(var note of this.notes){
            let [element, beat] = comparor.getElementAt8thNoteBeat(eigthPointer);
            console.log(beat + ", " + eigthPointer);
            if(beat == eigthPointer){
                if(typeof element != typeof note) {
                    console.log("different element at beat" + beat);
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
        let noteName : string = noteStrings[this.note % 12] + "/" + (this.note/12).toString();
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