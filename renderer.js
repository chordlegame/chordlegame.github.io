//@ts-check
/**
 * A
 * @param {string} element 
 * @param {sequence} seq 
 * @param {number} beatsnum
 * @param {number} measurenum
 */

 const matchColors = {
    0: '#818384', //grey
    1: '#6aaa64', //green
    2: '#c9b458', //yellow
    3: '#c98447' //orange
}

class vexflowBeamGroup {
    constructor(){
        this.groups = [[]];
        this.groupPointer = 0;
    }

    pushNoteToGroup(n){
        this.groups[this.groupPointer].push(n);
    }

    pushNewGroup(){
        this.groups.push([]);
        this.groupPointer++;
    }

    pushToNewGroup(n){
        this.pushNewGroup();
        this.pushNoteToGroup(n);
    }

    pushExclusiveGroup(n){
        this.groups.push(n, []);
        this.groupPointer += 2;
    }

    getAllBeams() {
        let filtered = this.groups.filter(g => g.length > 1);
        filtered.forEach(group => {
            let dir = 0;
            for(var note of group){
                dir += note.getStemDirection();
            }
            dir = dir > 0 ? 1 : -1;
            for(var note of group){
                note.setStemDirection(dir);
            }
        })
        let beams = filtered.map(g => new VF.Beam(g));
        console.log(filtered);
        return beams;
    }
}

function drawSVG(element, measurenum, beatsnum, seq = null, colors = null, targetWidth = 500){
    var measureNum = measurenum;
    var beatsNum = measureNum * beatsnum;
    var beatspM = beatsnum;

    var div = document.getElementById(element)
    if(div.childElementCount > 0)
        div.removeChild(div.firstChild);
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    var sc = Math.min(targetWidth, $(window).width()) / 500;
    var width = targetWidth * sc, height = 85 * sc, yoffset = -15 * sc;

    // Size our SVG:
    renderer.resize(width, height);
    var stave = new VF.Stave(25, yoffset, width - (50 * sc), {fill_style : 'white', spacing_between_lines_px: Math.floor(10 * sc)});

    var context = renderer.getContext();

    stave.setContext(context).draw();

    context.setFillStyle('white');
    context.setStrokeStyle('white');

    var notes = [];
    var tuples = [];
    var ties = [];
    var beamGroup = new vexflowBeamGroup();

    var eigthPointer = 0;

    if(seq != null){
        if(!seq.notes) return;
        measureNum = seq.measures;
        beatsNum = seq.beatsPerMeasure * measureNum;
        beatspM = seq.beatsPerMeasure;
        for(var elem of seq.notes){
            // @ts-ignore
            if(elem instanceof Note){
                let toNextBreak = 8 - (eigthPointer % 8);
                if (elem.duration > toNextBreak){
                    let dir0 = durationStrings[toNextBreak] != null ? toNextBreak : toNextBreak + 1,
                        dir1 = durationStrings[elem.duration - toNextBreak] != null ? elem.duration - toNextBreak : elem.duration - toNextBreak + 1;
                    let note0 = new Note(elem.note, dir0).toVFNote(), 
                        note1 = new Note(elem.note, dir1).toVFNote();
                    
                    notes.push(note0, new VF.BarNote(), note1);
                    ties.push(new VF.StaveTie({first_note: note0, last_note: note1, first_indices: [0], last_indices: [0]}));
                    beamGroup.pushNewGroup();
                }
                else {
                    let n = elem.toVFNote();
                    if(elem.duration < 2){
                        if ((eigthPointer % 4) > 0) beamGroup.pushNoteToGroup(n);
                        else beamGroup.pushToNewGroup(n);
                    }
                    else beamGroup.pushNewGroup();
                    notes.push(n);
                }
            }
            // @ts-ignore
            else if (elem instanceof Triplet){
                // @ts-ignore
                let [tuple, tnotes] = elem.toVFNotes();
                notes.push(tnotes[0], tnotes[1], tnotes[2]);
                tuples.push(tuple);
                beamGroup.pushExclusiveGroup(tnotes);
            }
            // @ts-ignore
            else if (elem instanceof Rest){
                // @ts-ignore
                notes.push(elem.toVFRest());
                beamGroup.pushNewGroup();
            }
            eigthPointer += elem.duration;

            if(eigthPointer % 8 == 0){
                notes.push(new VF.BarNote());
            }
        }
    }

    while(eigthPointer < (beatsNum * 2)){
        let maxlength = ((beatsNum * 2) - eigthPointer) % 8;
        if(maxlength > 4 || maxlength == 0) maxlength = 4;
        let duration = durationStrings[maxlength];
        notes.push(new VF.GhostNote({duration: duration}));
        eigthPointer += maxlength;

        if(eigthPointer % 8 == 0 && eigthPointer < beatsNum * 2){
            notes.push(new VF.BarNote());
        }
    }

    if (colors != null){
        let indexOfColor = 0;
        notes.forEach(function(note){
            if(!(note instanceof VF.StaveNote)) return;

            //console.log(indexOfColor + ": " + colors[indexOfColor]);

            let col = matchColors[colors[indexOfColor]];

            note.setStyle({fillStyle: col, strokeStyle: col});
            if(!ties.map(t => t.first_note == note).includes(true)) indexOfColor++;
        });
    }

    var beams = beamGroup.getAllBeams();
        
    VF.Formatter.FormatAndDraw(context, stave, notes);

    ties.forEach(function(t) { t.setContext(context).draw(); });
    
    beams.forEach(function(beam) {
        beam.setContext(context).draw();
    });

    tuples.forEach(function(tuple) {
        tuple.setContext(context).draw();
    })
}