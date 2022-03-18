//@ts-check
/**
 * A
 * @param {string} element 
 * @param {sequence} seq 
 * @param {number} beatsnum
 * @param {number} measurenum
 */

function drawSVG(element, measurenum, beatsnum, seq = null, drawChords = true){
    var measureNum = measurenum;
    var beatsNum = measureNum * beatsnum;
    var beatspM = beatsnum;

    var div = document.getElementById(element)
    if(div.childElementCount > 0)
        div.removeChild(div.firstChild);
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    // Size our SVG:
    renderer.resize(500, 85);
    var stave = new VF.Stave(25, -15, 450, {fill_style : 'white'});

    var context = renderer.getContext();

    stave.setContext(context).draw();

    context.setFillStyle('white');
    context.setStrokeStyle('white');

    var notes = [];
    var tuples = [];

    var eigthPointer = 0;

    if(seq != null){
        if(!seq.notes) return;
        measureNum = seq.measures;
        beatsNum = seq.beatsPerMeasure * measureNum;
        beatspM = seq.beatsPerMeasure;
        for(var elem of seq.notes){
            // @ts-ignore
            if(elem instanceof Note){
                // @ts-ignore
                notes.push(elem.toVFNote());
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

    var beams = VF.Beam.generateBeams(notes);

    VF.Formatter.FormatAndDraw(context, stave, notes);

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

function drawSVGWithColor(element, measurenum, beatsnum, seq, colors){
    var measureNum = measurenum;
    var beatsNum = measureNum * beatsnum;
    var beatspM = beatsnum;

    var div = document.getElementById(element)
    if(div.childElementCount > 0)
        div.removeChild(div.firstChild);
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    // Size our SVG:
    renderer.resize(500, 85);
    var stave = new VF.Stave(25, -15, 450, {fill_style : 'white'});

    var context = renderer.getContext();

    stave.setContext(context).draw();

    context.setFillStyle('white');
    context.setStrokeStyle('white');

    var notes = [];
    var tuples = [];

    var eigthPointer = 0;

    if(seq != null){
        if(!seq.notes) return;
        measureNum = seq.measures;
        beatsNum = seq.beatsPerMeasure * measureNum;
        beatspM = seq.beatsPerMeasure;
        for(var elem of seq.notes){
            // @ts-ignore
            if(elem instanceof Note){
                // @ts-ignore
                notes.push(elem.toVFNote());
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
        indexOfColor++;
    });

    var beams = VF.Beam.generateBeams(notes);

    VF.Formatter.FormatAndDraw(context, stave, notes);

    beams.forEach(function(beam) {
        beam.setContext(context).draw();
    });
}