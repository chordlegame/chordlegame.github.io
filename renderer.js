//@ts-check
/**
 * A
 * @param {string} element 
 * @param {sequence} seq 
 * @param {number} beatsnum
 * @param {number} measurenum
 */

function drawSVG(element, measurenum, beatsnum, seq = null, targetWidth = 500){
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
                    let dir0 = durationStrings[toNextBreak] != null ? toNextBreak : toNextBreak + 1;
                    let dir1 = durationStrings[elem.duration - toNextBreak] != null ? elem.duration - toNextBreak : elem.duration - toNextBreak + 1;
                    let note0 = new Note(elem.note, dir0).toVFNote();
                    let note1 = new Note(elem.note, dir1).toVFNote();
                    
                    notes.push(note0);
                    notes.push(new VF.BarNote());
                    notes.push(note1);
                    ties.push(new VF.StaveTie({first_note: note0, last_note: note1, first_indices: [0], last_indices: [0]}));
                }
                else {
                    notes.push(elem.toVFNote());
                }
            }
            // @ts-ignore
            else if (elem instanceof Triplet){
                // @ts-ignore
                let [tuple, tnotes] = elem.toVFNotes();
                notes.push(tnotes);
                tuples.push(tuple);
            }
            // @ts-ignore
            else if (elem instanceof Rest){
                // @ts-ignore
                notes.push(elem.toVFRest());
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

    var beams = VF.Beam.generateBeams(notes);

    VF.Formatter.FormatAndDraw(context, stave, notes);

    ties.forEach(function(t) {t.setContext(context).draw()});
    
    beams.forEach(function(beam) {
        beam.setContext(context).draw();
    });
}

const matchColors = {
    0: '#818384', //grey
    1: '#6aaa64', //green
    2: '#c9b458', //yellow
    3: '#c98447' //orange
}

function drawSVGWithColor(element, measurenum, beatsnum, seq, colors, targetWidth = 500){
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

    var eigthPointer = 0;

    if(seq != null){
        if(!seq.notes) return;
        measureNum = seq.measures;
        beatsNum = seq.beatsPerMeasure * measureNum;
        beatspM = seq.beatsPerMeasure;
        for(var elem of seq.notes){
            // @ts-ignore
            if(elem instanceof Note){
                let toNextBreak = ((7 - eigthPointer) % 8) + 1;
                if (elem.duration > toNextBreak){
                    let dir0 = durationStrings[toNextBreak] != null ? toNextBreak : toNextBreak + 1;
                    let dir1 = durationStrings[elem.duration - toNextBreak] != null ? elem.duration - toNextBreak : elem.duration - toNextBreak + 1;
                    let note0 = new Note(elem.note, dir0).toVFNote();
                    let note1 = new Note(elem.note, dir1).toVFNote();
                    
                    notes.push(note0);
                    notes.push(new VF.BarNote());
                    notes.push(note1);
                    ties.push(new VF.StaveTie({first_note: note0, last_note: note1, first_indices: [0], last_indices: [0]}));
                }
                else {
                    notes.push(elem.toVFNote());
                }
            }
            // @ts-ignore
            else if (elem instanceof Triplet){
                // @ts-ignore
                let [tuple, tnotes] = elem.toVFNotes();
                notes.push(tnotes);
                tuples.push(tuple);
            }
            // @ts-ignore
            else if (elem instanceof Rest){
                // @ts-ignore
                notes.push(elem.toVFRest());
            }
            eigthPointer += elem.duration;

            if(eigthPointer % 8 == 0){
                notes.push(new VF.BarNote());
            }
        }
    }

    while(eigthPointer < (beatsNum * 2)){
        if(eigthPointer % 8 == 0 && eigthPointer != 0){
            notes.push(new VF.BarNote());
        }
        let maxlength = (beatsNum * 2 - eigthPointer);
        if(maxlength > 4) maxlength = 4;
        let duration = durationStrings[maxlength];
        notes.push(new VF.GhostNote({duration: duration}));
        eigthPointer += maxlength;
    }

    let indexOfColor = 0;
    notes.forEach(function(note){
        if(!(note instanceof VF.StaveNote)) return;

        console.log(indexOfColor + ": " + colors[indexOfColor]);

        let col = matchColors[colors[indexOfColor]];

        note.setStyle({fillStyle: col, strokeStyle: col});
        if(!ties.map(t => t.first_note == note).includes(true)) indexOfColor++;
    });

    var beams = VF.Beam.generateBeams(notes);

    VF.Formatter.FormatAndDraw(context, stave, notes);

    ties.forEach(function(t) {t.setContext(context).draw()})
    beams.forEach(function(beam) {
        beam.setContext(context).draw();
    });
}