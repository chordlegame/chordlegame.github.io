//@ts-check

let test_sequence = new sequence(2, 4);
test_sequence.pushNote(60, 3);
test_sequence.pushNote(62, 1);
test_sequence.pushNote(64, 2);
test_sequence.pushNote(65, 2);
test_sequence.pushNote(67, 2);


drawSVG("sheet0", 0, 0, test_sequence);
drawSVG("sheet1", 2, 4);
drawSVG("sheet2", 2, 4);
drawSVG("sheet3", 2, 4);
drawSVG("sheet4", 2, 4);
drawSVG("sheet5", 2, 4);

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
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    // Size our SVG:
    renderer.resize(500, 80);

    var stave = new VF.Stave(25, 0, 450, {fill_style : 'white'});

    var context = renderer.getContext();

    stave.setContext(context).draw();

    context.setFillStyle('white');
    context.setStrokeStyle('white');

    var notes = [];
    var tuples = [];

    var eigthPointer = 0;

    if(seq != null){
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

    // Create a voice in 4/4 and add the notes from above
    var voice = new VF.Voice({num_beats: beatsNum,  beat_value: beatspM});
    voice.addTickables(notes);

    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 450);

    voice.draw(context, stave);
}