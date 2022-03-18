//@ts-check

class gameSequence {
    //sequence : sequence;
    //matches : number[];

    /**
     * 
     * @param {sequence} seq;
     */
    constructor(seq){
        this.sequence = new sequence(seq.measures, seq.beatsPerMeasure);
        this.sequence.notes = [];
        this.matches = [];
    }
}

const lengthChars = {
    0: "",
    1: "𝅘𝅥𝅮",
    2: "𝅘𝅥",
    3: "𝅘𝅥𝅭",
    4: "𝅗𝅥",
    6: "𝅗𝅥𝅭",
    8: "𝅝",
};

class Game {
    //baselineSequence : sequence;

    //rows : [gameSequence, gameSequence, gameSequence, gameSequence, gameSequence, gameSequence];
    //currentattempt : number = -1;
//
    //activeSequence : sequence;
//
    //inputLength : number = 0;
    //lengthElement : Element;
    //
    //winElement : Element;
    //loseElement: Element;

    /**
     * @param {sequence} base 
     */
    constructor(base){
        this.currentattempt = -1;
        this.inputLength = 0;
        this.currentLength = 0;
        this.dotted = false;

        this.baselineSequence = base;

        this.octave = false;

        this.rows = [
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base)
        ];

        drawSVG("sheet0", 2, 4, this.rows[0].sequence);
        drawSVG("sheet1", 2, 4, this.rows[0].sequence);
        drawSVG("sheet2", 2, 4, this.rows[0].sequence);
        drawSVG("sheet3", 2, 4, this.rows[0].sequence);
        drawSVG("sheet4", 2, 4, this.rows[0].sequence);
        drawSVG("sheet5", 2, 4, this.rows[0].sequence);

        this.advanceSequence();
    }

    advanceSequence() {
        if(this.currentattempt >= 0){
            let [matches, win] = this.rows[this.currentattempt].sequence.compare(this.baselineSequence);
            this.rows[this.currentattempt].matches = matches;

            drawSVGWithColor("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence, matches);

            if(win){
                this.Win();
                return;
            }

            if(this.currentattempt == 5){
                this.Lose();
                return;
            }
        }

        this.currentattempt++;
        
        this.activeSequence = this.rows[this.currentattempt].sequence;

        this.currentLength = 0;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }

    Win(){
        console.log("WIN!!!!");
    }

    Lose(){
        console.log("LOSE :(");
    }

    changeLength(newlength){
        document.getElementById("pbl" + this.inputLength.toString()).classList.remove('piano-button-pressed')

        this.inputLength = newlength;

        document.getElementById("pbl" + this.inputLength.toString()).classList.add('piano-button-pressed');
    }

    toggleOctave(){
        this.octave = !this.octave;
        if(this.octave) document.getElementById("pbup").classList.add('piano-button-pressed')
        else document.getElementById("pbup").classList.remove('piano-button-pressed')
    }

    toggleDot(){
        this.dotted = !this.dotted
        if(this.dotted) document.getElementById("pbdot").classList.add('piano-button-pressed')
        else document.getElementById("pbdot").classList.remove('piano-button-pressed')
    }

    pushNote(note){
        let duration = this.inputLength + (this.dotted ? this.inputLength/2 : 0);

        if((duration + this.currentLength) > (this.activeSequence.measures * this.activeSequence.beatsPerMeasure * 2)) {
            return;
        }

        this.activeSequence.pushNote(note + (this.octave ? 5*12 : 4*12), duration);

        this.currentLength += duration;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }

    pushRest(){
        let duration = this.inputLength + (this.dotted ? this.inputLength/2 : 0);

        if((duration + this.currentLength) > (this.activeSequence.measures * this.activeSequence.beatsPerMeasure * 2)) {
            return;
        }

        this.activeSequence.pushRest(duration);

        this.currentLength += duration;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }

    deleteNote(){
        this.currentLength -= this.activeSequence.deleteLast();

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }
}