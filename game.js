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

        this.baselineSequence = base;

        this.lengthElement = document.getElementById("lengthDisplay");
        this.lengthElement.textContent = lengthChars[this.inputLength];

        this.octave = false;

        this.rows = [
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base), 
            new gameSequence(base)
        ];

        this.advanceSequence();
    }

    advanceSequence() {
        if(this.currentattempt >= 0){
            let [matches, win] = this.rows[0].sequence.compare(this.baselineSequence);
            this.rows[this.currentattempt].matches = matches;

            //renderer.render whatever idc with htmelement

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

        //renderer.render whatever again
    }

    Win(){
        //overlay win element somehow
    }

    Lose(){
        //overlay lose element somehow
    }

    changeLength(newlength){
        this.inputLength = newlength;
        this.lengthElement.textContent = lengthChars[newlength];
    }

    pushNote(note){
        this.activeSequence.pushNote(note + (this.octave ? 4*12 : 5*12), this.inputLength);

        window.alert("hi");
    }
}