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

        drawSVG("sheet0", 2, 4, this.rows[0]);
        drawSVG("sheet1", 2, 4, this.rows[0]);
        drawSVG("sheet2", 2, 4, this.rows[0]);
        drawSVG("sheet3", 2, 4, this.rows[0]);
        drawSVG("sheet4", 2, 4, this.rows[0]);
        drawSVG("sheet5", 2, 4, this.rows[0]);

        this.advanceSequence();
    }

    advanceSequence() {
        if(this.currentattempt >= 0){
            let [matches, win] = this.rows[0].sequence.compare(this.baselineSequence);
            this.rows[this.currentattempt].matches = matches;

            drawSVGWithColor("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence, this.baselineSequence);

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
        //overlay win element somehow
    }

    Lose(){
        //overlay lose element somehow
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

    pushNote(note){
        if((this.inputLength + this.currentLength) > (this.activeSequence.measures * this.activeSequence.beatsPerMeasure * 2)) {
            return;
        }

        this.activeSequence.pushNote(note + (this.octave ? 5*12 : 4*12), this.inputLength);

        this.currentLength += this.inputLength;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }
}