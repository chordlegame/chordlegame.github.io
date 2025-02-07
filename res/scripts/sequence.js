"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.sequence = void 0;
var VF = Vex.Flow;
var durationStrings = {
    1: "8",
    2: "q",
    3: "qd",
    4: "h",
    6: "hd",
    8: "w"
};
var noteStrings = {
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
};
var noteNumbers = {
    "c": 0,
    "d": 2,
    "e": 4,
    "f": 5,
    "g": 7,
    "a": 9,
    "b": 11
};
var toneDurationStrings = {
    1: "8n",
    2: "4n",
    3: "4n.",
    4: "2n",
    6: "2n.",
    8: "1n"
};
function toToneTimeString(time) {
    var _a = toToneTimeNumber(time), measure = _a[0], quarter = _a[1], eighth = _a[2];
    return measure + ":" + quarter + ":" + eighth;
}
function toTimeString(timestruct) {
    return timestruct[0] + ":" + timestruct[1] + ":" + timestruct[2];
}
function toToneTimeNumber(time) {
    var measure = Math.floor(time / 8);
    var quarter = Math.floor((time % 8) / 2);
    var eighth = (time % 2) * 2;
    return [measure, quarter, eighth];
}
var ChordType = /** @class */ (function () {
    function ChordType(suffixstring, notestring) {
        this.suffixes = suffixstring.replace(" ", "").split(",");
        this.notes = notestring.replace(" ", "").split(",").map(function (x) { return +x; });
    }
    return ChordType;
}());
var chordTypes = [
    new ChordType("5", "0,7"),
    new ChordType(",M", "0,4,7"),
    new ChordType("-,m", "0,3,7"),
    new ChordType("o,dim", "0,3,6"),
    new ChordType("+,aug", "0,4,8"),
    new ChordType("6", "0,4,7,9"),
    new ChordType("m6,-6", "0,3,7,9"),
    new ChordType("7", "0,4,7,10"),
    new ChordType("M7,maj7", "0,4,7,11"),
    new ChordType("m7,-7,mi7", "0,3,7,10"),
    new ChordType("o7,dim7", "0,3,6,9"),
    new ChordType("o/7,hd7", "0,3,6,10"),
    new ChordType("9", "0,4,7,10,14"),
    new ChordType("M9,maj9", "0,4,7,11,14"),
    new ChordType("mi9,-9,m9", "0,3,7,10,14"),
    new ChordType("6/9,69", "0,4,7,9,14"),
];
//returns the note + the offset when the note ends
function extractNote(input) {
    var note = noteNumbers[input.charAt(0).toLowerCase()];
    var offset = 2;
    if (input.charAt(1) == 's' || input.charAt(1) == '#')
        note++;
    else if (input.charAt(1) == 'b')
        note--;
    else
        offset = 1;
    //console.log(input + ", note: " + note + ", offset: " + offset + ", charAt: " + input.charAt(1))
    return [note, offset];
}
var Chord = /** @class */ (function () {
    function Chord(inputstr, duration) {
        var _this = this;
        this.isvalid = false;
        this.name = inputstr;
        this.duration = duration;
        var _a = extractNote(inputstr), root = _a[0], charoffset = _a[1];
        //console.log(charoffset);
        root += 12 * 2;
        if (isNaN(root))
            return;
        //console.log(root);
        chordTypes.forEach(function (e) {
            e.suffixes.forEach(function (suffix) {
                if (inputstr.substring(charoffset) === suffix) {
                    _this.notes = e.notes.map(function (e) { return new Note(e + root, duration); });
                    _this.notes.forEach(function (n) { return console.log(n); });
                    _this.isvalid = true;
                    return;
                }
            });
        });
    }
    Chord.prototype.toChordSymbol = function () {
        var an = new VF.Annotation(this.name);
        return an;
    };
    Chord.prototype.toToneString = function (chordNumber) {
        var notes = this.notes.map(function (note) { return noteStrings[note.note % 12] + (Math.floor(note.note / 12) + 1); });
        return [notes, toToneTimeString(chordNumber * this.duration)];
    };
    return Chord;
}());
function sequenceFromFile(sequences, index) {
    if (index === void 0) { index = 0; }
    var inputstrings = sequences.split(";");
    //console.log(inputstrings[0])
    var seq = sequenceFromString(inputstrings[index % inputstrings.length]);
    return seq;
}
function sequenceFromString(seqString) {
    var lines = seqString.split("\n");
    var seq = new sequence(0, 0);
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var tokens = line.split(" ");
        switch (tokens[0].toLowerCase()) {
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
                for (var _a = 0, _b = tokens.slice(2); _a < _b.length; _a++) {
                    var chord = _b[_a];
                    switch (chord) {
                        case '-':
                            seq.chords.push(null);
                            break;
                        case '#':
                            seq.pushChord(seq.chords[seq.chords.length - 1].name, +tokens[1]);
                            break;
                        default:
                            seq.pushChord(chord, +tokens[1]);
                            break;
                    }
                }
                break;
            case "melody":
                processMelody(line.substring(tokens[0].length + 1), seq);
                break;
        }
    }
    return seq;
}
function processMelody(source, seq) {
    var splitreg = / (?![^\[]*\])/;
    var tokens = source.split(splitreg, -1);
    console.log(tokens);
    for (var index = 0; index < tokens.length; index++) {
        var notestr = tokens[index];
        var duration = 1;
        if (notestr.charAt(0) === '3') {
            var clean = notestr.substring(notestr.indexOf('[') + 1, notestr.indexOf(']'));
            var trtokens = clean.split(" ");
            var notes = [];
            for (var i = 0; i < 3; i++) {
                var _a = extractNote(trtokens[i]), notenum = _a[0], charoffset = _a[1];
                var octave = +trtokens[i].substring(charoffset);
                notes.push(notenum + (octave * 12));
            }
            seq.pushTuple(notes[0], notes[1], notes[2], duration);
        }
        else {
            while (tokens[index + 1] === '#') {
                duration++;
                index++;
            }
            if (notestr === '-') {
                seq.pushRest(duration);
            }
            else {
                var _b = extractNote(notestr), notenum = _b[0], charoffset = _b[1];
                var octave = +notestr.substring(charoffset);
                seq.pushNote(notenum + (octave * 12), duration);
            }
        }
    }
}
function stringFromMelody(sequence) {
    var string = '';
    var noteToString = function (n) { return noteStrings[n.note % 12] + (Math.floor(n.note / 12)); };
    for (var _i = 0, _a = sequence.notes; _i < _a.length; _i++) {
        var n = _a[_i];
        if (n instanceof Rest) {
            string += '- ';
        }
        else if (n instanceof Note) {
            string += noteToString(n) + ' ';
        }
        else if (n instanceof Triplet) {
            string += '3[' +
                noteToString(n.note0) + ' ' +
                noteToString(n.note1) + ' ' +
                noteToString(n.note2) + ' ' +
                '] ';
        }
        for (var i = 1; i < n.duration; i++) {
            string += '# ';
        }
    }
    return string;
}
var sequence = /** @class */ (function () {
    function sequence(measures, beatsPerMeasure) {
        this.measures = measures;
        this.beatsPerMeasure = beatsPerMeasure;
        this.notes = [];
        this.chords = [];
    }
    sequence.prototype.pushNote = function (notenumber, duration) {
        this.notes.push(new Note(notenumber, duration));
        return this;
    };
    sequence.prototype.pushRest = function (duration) {
        this.notes.push(new Rest(duration));
        return this;
    };
    sequence.prototype.pushTuple = function (note0, note1, note2, duration) {
        this.notes.push(new Triplet(note0, note1, note2, duration));
        return this;
    };
    sequence.prototype.deleteLast = function () {
        return this.notes.pop().duration;
    };
    sequence.prototype.pushChord = function (chord, duration) {
        //console.log(chord + "," + duration)
        this.chords.push(new Chord(chord, duration));
    };
    sequence.prototype.getLength = function () {
        var l = 0
        this.notes.forEach(element => {
            l += element.duration 
        });
        return l
    }

    /*
    colors:
    0: grey
    1: green
    2: light yellow
    3: orange
    */
    //returns an array of integers analagous to the object being enacted upon, win
    sequence.prototype.compare = function (comparor) {
        var arr = [];
        var eigthPointer = 0;
        var win = true;
        if (comparor.notes.length != this.notes.length)
            win = false;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            var _b = comparor.getElementAt8thNoteBeat(eigthPointer), element = _b[0], beat = _b[1];
            //console.log(beat + ", " + eigthPointer);
            if (beat == eigthPointer) {
                if (typeof element != typeof note) {
                    //console.log("different element at beat" + beat);
                    if (note instanceof Triplet)
                        arr.push(0, 0, 0);
                    else
                        arr.push(0);
                    win = false;
                }
                else if (element instanceof Note) {
                    var extranotes = false;
                    for (var i = beat + 1; i < beat + note.duration; i++) {
                        var _c = comparor.getElementAt8thNoteBeat(i), h = _c[0], j = _c[1];
                        if (h != element) {
                            extranotes = true;
                        }
                    }
                    if (extranotes) {
                        arr.push(3);
                        win = false;
                    }
                    else if (element.note == note.note)
                        arr.push(1);
                    else {
                        arr.push(2);
                        win = false;
                    }
                }
                else if (element instanceof Rest) {
                    arr.push(0);
                }
                else if (element instanceof Triplet) {
                    if (element.duration != note.duration) {
                        arr.push(0, 0, 0);
                    }
                    var isgreen = function (n0, n1) { return n0 == n1 ? 1 : 2; };
                    arr.push(isgreen(element.note0.note, note.note0.note), isgreen(element.note1.note, note.note1.note), isgreen(element.note2.note, note.note2.note));
                }
            }
            else {
                if (note instanceof Triplet)
                    arr.push(0, 0, 0);
                else
                    arr.push(0);
                win = false;
            }
            eigthPointer += note.duration;
        }
        return [arr, win];
    };
    sequence.prototype.getElementAt8thNoteBeat = function (beat) {
        var eigthPointer = 0;
        var beatofnote = 0;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            eigthPointer += note.duration;
            if (eigthPointer > beat) {
                return [note, beatofnote];
            }
            beatofnote = eigthPointer;
        }
        return [null, eigthPointer];
    };
    sequence.prototype.toToneArray = function () {
        var notes = [];
        var toNote = function (n) { return noteStrings[n % 12] + (Math.floor(n / 12) + 1); };
        var eigthPointer = 0;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var n = _a[_i];
            if (n instanceof Rest) { }
            else if (n instanceof Note) {
                var note = toNote(n.note);
                var start = toToneTimeString(eigthPointer);
                var obj = { time: start, note: note, duration: toneDurationStrings[n.duration] };
                //console.log(obj);
                notes.push(obj);
            }
            else if (n instanceof Triplet) {
                var start = toToneTimeNumber(eigthPointer);
                var offset1 = this.swing ? n.duration / 2 : ((n.duration * 2) / 3)
                var offset2 = this.swing ? n.duration / 1 : ((n.duration * 4) / 3)
                var time1 = [start[0], start[1], start[2] + offset1], time2 = [start[0], start[1], start[2] + offset2];
                var duration = toneDurationStrings[n.note0.duration].charAt(0) + "t";
                var objs = [
                    { time: toTimeString(start), note: toNote(n.note0.note), duration: duration },
                    { time: toTimeString(time1), note: toNote(n.note1.note), duration: duration },
                    { time: toTimeString(time2), note: toNote(n.note2.note), duration: duration }
                ];
                notes.push(objs[0], objs[1], objs[2]);
            }
            eigthPointer += n.duration;
        }
        return notes;
    };
    return sequence;
}());
exports.sequence = sequence;
var StaffElement = /** @class */ (function () {
    function StaffElement(duration) {
        this.duration = duration;
    }
    return StaffElement;
}());
var Note = /** @class */ (function (_super) {
    __extends(Note, _super);
    function Note(note, duration) {
        var _this = _super.call(this, duration) || this;
        _this.note = note;
        return _this;
    }
    Note.prototype.toVFNote = function (triplet) {
        if (triplet === void 0) { triplet = false; }
        var noteName = noteStrings[this.note % 12] + "/" + Math.floor(this.note / 12).toString();
        var duration = durationStrings[this.duration];
        var stavenote = new VF.StaveNote({ clef: "treble", keys: [noteName], duration: duration });
        if (noteName.length > 1) {
            if (noteName.charAt(1) == '#')
                stavenote.addAccidental(0, new VF.Accidental("#"));
            if (noteName.charAt(1) == 'b')
                stavenote.addAccidental(0, new VF.Accidental("b"));
        }
        if (duration.length > 1)
            stavenote.addDot(0);
        stavenote.autoStem();
        return stavenote;
    };
    return Note;
}(StaffElement));
var Triplet = /** @class */ (function (_super) {
    __extends(Triplet, _super);
    function Triplet(note0, note1, note2, duration) {
        var _this = _super.call(this, duration * 2) || this;
        _this.note0 = new Note(note0, duration);
        _this.note1 = new Note(note1, duration);
        _this.note2 = new Note(note2, duration);
        return _this;
    }
    Triplet.prototype.toVFNotes = function () {
        var arr = [
            this.note0.toVFNote(), this.note1.toVFNote(), this.note2.toVFNote()
        ];
        return [new VF.Tuplet(arr), arr];
    };
    return Triplet;
}(StaffElement));
var Rest = /** @class */ (function (_super) {
    __extends(Rest, _super);
    function Rest(duration) {
        return _super.call(this, duration) || this;
    }
    Rest.prototype.toVFRest = function () {
        return new VF.StaveNote({ clef: "treble", keys: ["b/4"], duration: durationStrings[this.duration] + "r" });
    };
    return Rest;
}(StaffElement));
