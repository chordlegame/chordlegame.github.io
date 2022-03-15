//@ts-check
/**
 * 
 * @param {string} element 
 * @param {sequence} seq 
 */

function drawSVG(element, measurenum, beatsnum, seq = null){
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

function drawSVGWithColor(element, measurenum, beatsnum, seq, base){
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

    let colors = seq.compare(base);

    let indexOfColor = 0;
    notes.forEach(function(note){
        let colnumber = colors[indexOfColor];
        let col = '#818384';
        
        switch (colnumber){
            case 1: col = '#c9b458'; break;
            case 2: col = '#6aaa64'; break;
        }

        note.setStyle({fillStyle: col, strokeStyle: col});
        indexOfColor++;
    });

    var beams = VF.Beam.generateBeams(notes);

    VF.Formatter.FormatAndDraw(context, stave, notes);

    beams.forEach(function(beam) {
        beam.setContext(context).draw();
    });
}