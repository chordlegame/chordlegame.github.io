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
    constructor(base, debuggame = false){
        this.debug = debuggame;
        this.currentattempt = -1;
        this.inputLength = 2;
        this.currentLength = 0;
        this.dotted = false;
        this.playing = true;
        this.currentTuple = null;

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

        if (this.debug) { drawSVG("sheet5", 2, 4, this.baselineSequence); }

        this.advanceSequence();
    }

    advanceSequence() {
        if(this.currentattempt >= 0){
            let lenAttempt = this.rows[this.currentattempt].sequence.getLength()
            let lenfull = this.baselineSequence.getLength()

            while (lenAttempt < lenfull){
                let delta = lenfull - lenAttempt
                let len = (delta % 8) == 0 ? 8 : (delta % 4) == 0 ? 4 : (delta % 2) == 0 ? 2 : 1
                console.log(len)
                this.rows[this.currentattempt].sequence.pushRest(len)
                lenAttempt = this.rows[this.currentattempt].sequence.getLength()
            }
            console.log(lenAttempt)

            let [matches, win] = this.rows[this.currentattempt].sequence.compare(this.baselineSequence);
            this.rows[this.currentattempt].matches = matches;

            drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence, matches);

            if(win){
                this.playing = false;
                this.Win();
                return;
            }

            if(this.currentattempt == 5){
                this.playing = false;
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

    startTuple(){
        if(this.currentTuple != null){
            this.currentTuple = null;
            document.getElementById("pbtr").classList.remove('piano-button-pressed')
        }
        else {
            this.currentTuple = [];
            document.getElementById("pbtr").classList.add('piano-button-pressed')
        }
    }

    pushToTuple(i){
        this.currentTuple.push(i);
        if(this.currentTuple.length == 3) {
            this.activeSequence.pushTuple(
                this.currentTuple[0],this.currentTuple[1],this.currentTuple[2], 
                this.inputLength + (this.dotted ? this.inputLength/2 : 0)
            );
            this.currentTuple = null;
            document.getElementById("pbtr").classList.remove('piano-button-pressed')
            drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
        }
    }

    pushNote(note){
        if(!this.playing) return;
        if(this.currentTuple != null) {
            this.pushToTuple(note + (this.octave ? 5*12 : 4*12));
            return;
        }
        let duration = this.inputLength + (this.dotted ? this.inputLength/2 : 0);

        if((duration + this.currentLength) > (this.activeSequence.measures * this.activeSequence.beatsPerMeasure * 2)) {
            return;
        }

        this.activeSequence.pushNote(note + (this.octave ? 5*12 : 4*12), duration);

        this.currentLength += duration;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }

    pushRest(){
        if(!this.playing) return;
        let duration = this.inputLength + (this.dotted ? this.inputLength/2 : 0);

        if((duration + this.currentLength) > (this.activeSequence.measures * this.activeSequence.beatsPerMeasure * 2)) {
            return;
        }

        this.activeSequence.pushRest(duration);

        this.currentLength += duration;

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }

    deleteNote(){
        if(!this.playing) return;

        if(this.currentTuple != null){
            this.currentTuple = null;
            document.getElementById("pbtr").classList.remove('piano-button-pressed')
            return;
        }

        this.currentLength -= this.activeSequence.deleteLast();

        drawSVG("sheet" + this.currentattempt.toString(), 0, 0, this.activeSequence);
    }
}