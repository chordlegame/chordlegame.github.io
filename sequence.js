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
var sequence = /** @class */ (function () {
    function sequence(measures, beatsPerMeasure) {
        this.measures = measures;
        this.beatsPerMeasure = beatsPerMeasure;
        this.notes = [];
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
    //returns an array of integers analagous to the object being enacted upon, win
    sequence.prototype.compare = function (comparor) {
        var arr = [];
        var eigthPointer = 0;
        var win = true;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            var _b = this.getElementAt8thNoteBeat(eigthPointer), element = _b[0], beat = _b[1];
            if (typeof element != typeof note) {
                if (note instanceof Triplet)
                    arr.push(0, 0, 0);
                else
                    arr.push(0);
                win = false;
            }
            else if (element instanceof Note) {
                if (beat == eigthPointer) {
                    if (element.note == note.note)
                        arr.push(2);
                    else {
                        arr.push(1);
                        win = false;
                    }
                }
                else {
                    arr.push(0);
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
            }
            eigthPointer += note.duration;
        }
        return [arr, win];
    };
    sequence.prototype.getElementAt8thNoteBeat = function (beat) {
        var eigthPointer = 0;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            eigthPointer += note.duration;
            if (eigthPointer >= beat) {
                return [note, eigthPointer];
            }
        }
        return null;
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
        var noteName = noteStrings[this.note % 12] + "/" + (this.note / 12).toString();
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
        var arr = [this.note0.toVFNote(), this.note1.toVFNote(), this.note2.toVFNote()];
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
