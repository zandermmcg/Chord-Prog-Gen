import { fetchChords } from './fetchChords';
import { fetchChordMedia } from './fetchChordMedia';
import { Chord } from "tonal";
import ChordButton from './components/chordbutton';
import ChordGenError from './components/chordgenerror';

// Define the chromatic scale and scale intervals for building scales
const CHROMATIC_SCALE: string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALE_INTERVALS: {[Key: string]: number[]} = 
{ 
    "maj": [2, 2, 1, 2, 2, 2, 1],
    "min": [2, 1, 2, 2, 1, 2, 2],
    "minharmonic": [2, 1, 2, 2, 1, 3, 1],
    "minmelodic": [2, 1, 2, 2, 2, 2, 1]
};
const CHORD_INTERVALS: {[Key: string]: number[]} =
{
    "major": [0, 4, 7],  // Root, Major 3rd, Perfect 5th
    "minor": [0, 3, 7],  // Root, Minor 3rd, Perfect 5th
    "diminished": [0, 3, 6],  // Root, Minor 3rd, Diminished 5th
    "dominant7": [0, 4, 7, 10],  // Root, Major 3rd, Perfect 5th, Minor 7th
    "major7": [0, 4, 7, 11],  // Root, Major 3rd, Perfect 5th, Major 7th
    "minor7": [0, 3, 7, 10],  // Root, Minor 3rd, Perfect 5th, Minor 7th
    "diminished7": [0, 3, 6, 9],  // Root, Minor 3rd, Diminished 5th, Diminished 7th
};

// Roman Map for parsing roman numerals
const ROMAN_MAP: {[Key: string]: number} = {
    "i": 1,
    "ii": 2,
    "iii": 3,
    "iv": 4,
    "v": 5,
    "vi": 6,
    "vii": 7
};

// Common starting chords to determine first chord
const STARTING_CHORDS: {[Key: string]: string[][]} =
{
    "maj": [["I", "1"], ["vi", "6"], ["IV", "4"], ["V", "5"]],
    "min": [["i", "b1"], ["vi", "6"], ["V", "5"]]
}

// Helper function to determine the key based on form info passed into the function
function determineKey(note: string, accidental: string, mode: string)
{
    // Alter root if there is an accidental
    if (accidental === "#")
        note = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(note)+1)%12];
    else if (accidental === "b")
        note = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(note)-1+12)%12];

    return note + mode;
}

// Helper function to build a scale with any given key
function generateScale(key: string) {
    const scale = [];

    // Grab the starting index of the chord from the chromatic scale
    // and determine which intervals to use based on if its major or minor
    let startIndex = CHROMATIC_SCALE.indexOf(key.slice(0,key.indexOf("m")));
    let intervals = SCALE_INTERVALS[key.slice(key.indexOf("m"))];

    for (let interval of intervals) {
        scale.push(CHROMATIC_SCALE[startIndex % 12]); // Add the current note
        startIndex += interval; // Move to the next note
    }

    return scale;
}

// Mega helper function to parse the raw roman numeral returned by the API
function parseNumeral(rawNumeral: string)
{
    let numeralInitial: string = rawNumeral; // Initial RN State
    let chromAlter: string = ""; // Chromatic Alteration: flat or sharp
    let diminished: boolean = false; // Diminished: true or false
    let secondary: string = ""; // Secondary chord: if X/Y <- it would be 'X'
    let inversion: string = ""; // Note Inversion: will be a string of 0, 1, or 2 numbers
    let seventh: string = ""; // Seventh: if the chord should have a seventh, can be flat or sharp
    
    // Check for Flat Chromatic Alteration
    if (rawNumeral.indexOf("&#9837;") != -1)
    {
        chromAlter = "flat";
        // Slice it off of the RN
        rawNumeral = rawNumeral.slice(rawNumeral.indexOf("&#9837;") + 7);
    }
    // Check for Sharp Chromatic Alteration
    else if (rawNumeral.indexOf("&#9839;") != -1)
    {
        chromAlter = "sharp";
        // Slice it off of the RN
        rawNumeral = rawNumeral.slice(rawNumeral.indexOf("&#9839;") + 7)
    }

    // Inversion Step 1: Superscript Inversion number
    // While loop because sometimes there are more than 1 superscript inversions
    while (rawNumeral.indexOf("<sup>") != -1)
    {
        // Grab the number in between the <sup>...</sup> HTML
        let sup = rawNumeral.slice(rawNumeral.indexOf("<sup>")+5, rawNumeral.indexOf("</sup>"));

        // Sometimes exact inversion is unknown, will be handled later
        if (sup != "??") inversion += sup;
        //else inversion["??"] = "true";
        
        // Slice the inversion out of the RN
        rawNumeral = rawNumeral.slice(0, rawNumeral.indexOf("<sup>"))
                        + rawNumeral.slice(rawNumeral.indexOf("</sup>")+6);
    }

    // Inversion Step 2: Subscript Inversion Number
    // Unknown if there can be multiple subscript inv, while loop just in case
    while (rawNumeral.indexOf("<sub>") != -1)
    {
        // Grab the number in between the <sub>...</sub> HTML
        let sub = rawNumeral.slice(rawNumeral.indexOf("<sub>")+5, rawNumeral.indexOf("</sub>"));

        inversion += sub;
        
        // Slice the inversion out of the RN
        rawNumeral = rawNumeral.slice(0, rawNumeral.indexOf("<sub>"))
                        + rawNumeral.slice(rawNumeral.indexOf("</sub>")+6);
    }

    // Check for diminished
    if (rawNumeral.indexOf("&deg;") != -1)
    {
        diminished = true;
        
        // Slice it out of the RN
        rawNumeral = rawNumeral.slice(0, rawNumeral.indexOf("&deg;"))
                        + rawNumeral.slice(rawNumeral.indexOf("&deg;")+5);
    }
    
    // Check for secondary Chord
    if (rawNumeral.indexOf("/") != -1)
    {
        // Grab the chord before the '/'
        secondary = rawNumeral.slice(0, rawNumeral.indexOf("/"))
        
        // Slice the chord before the '/'
        rawNumeral = rawNumeral.slice(rawNumeral.indexOf("/")+1);
    }

    // Check for seventh
    if (rawNumeral.indexOf("7") != -1)
    {
        let charBefore = rawNumeral.charAt(rawNumeral.indexOf("7")-1);
        
        // Check if its a flat or sharp seventh, if so slice it out with the '7'
        if(charBefore === "b" || charBefore === "#")
        {
            seventh = rawNumeral.slice(rawNumeral.indexOf("7")-1);
            rawNumeral = rawNumeral.slice(0, rawNumeral.indexOf("7")-1);
        }
        else
        {
            seventh = "7";
            rawNumeral = rawNumeral.slice(0, rawNumeral.indexOf("7"));
        }
    }

    // Chord data in map form to make it easy to build the chord
    return {
        "numeral": rawNumeral,
        "numeral_initial": numeralInitial,
        "inversion" : inversion,
        "diminished": diminished,
        "chrom_alteration": chromAlter,
        "secondary": secondary,
        "seventh": seventh
    };
}

// Mega helper function to build the chord with the given chord data returned
// from the function above. This is where the music theory algorithms come in
function buildChord(key: string, chordInfo: {[key:string]: any})
{
    // Start by grabbing the chord note info
    let numeral = chordInfo["numeral"];
    const numeralInt: number = ROMAN_MAP[numeral.toLowerCase()]; // base numeral->int
    let scale: string[] = generateScale(key);
    let root: string = scale[numeralInt-1]; //-1 because of array indexing
    
    // Check the inversion, bc sometimes that will decide that
    // there is a seventh in the chord
    switch (chordInfo["inversion"])
    {
        case "7":
        case "65":
        case "43":
        case "42":
            chordInfo["seventh"] = "7";
            break;

        default:
            break;
    }

    // Chromatic Alteration will change the root of the chord, so we need to 
    // figure that out first.
    if (chordInfo["chrom_alteration"] !== "")
    {
        if (chordInfo["chrom_alteration"] === "flat")
            root = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(root)-1+12)%12];
        else
            root = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(root)+1)%12];
    }

    // Similar to chrom alteration, secondary chords will change the root
    // Chords from the api will never be chrom altered and secondary, so we don't
    // need to worry about that.
    if (chordInfo["secondary"] !== "")
    {
        let newKeyType:string;
        
        // If the original chord is minor, we need to use harmonic minor
        // Just a rule for secondary chords
        if (numeral.toLowerCase() === numeral)
            newKeyType = "minharmonic";
        else
            newKeyType = "maj";
        
        const secondaryScale = generateScale(root+newKeyType);
        const secondaryNumeralInt = ROMAN_MAP[chordInfo["secondary"].toLowerCase()];

        // Change our root and numeral to the secondary
        root = secondaryScale[secondaryNumeralInt-1];
        numeral = chordInfo["secondary"];
    }

    let chordType: string;
    
    // Dominant Chord
    if (numeral === "V" && chordInfo["seventh"] !== "")
        chordType = "dominant";
    // Diminished Chord
    else if (chordInfo["diminished"] == true)
        chordType = "diminished";
    // Minor Chord
    else if (numeral.toLowerCase() === numeral)
        chordType = "minor";
    // Major Chord
    else
        chordType = "major";

    // Add seventh if needed
    if (chordInfo["seventh"] !== "") chordType += "7";

    // Build the chord with all of the information gathered
    let completedChord: string[] = [];
    let nextNote: string;
    const noteIntervals = CHORD_INTERVALS[chordType];

    // Use proper intervals depending on the chordType
    for (let interval of noteIntervals)
    {
        nextNote = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(root)+interval)%12];
        completedChord.push(nextNote);
    }

    // Sometimes the seventh is flattened or sharped:
    if (chordInfo["seventh"].length > 1)
    {
        let diff: number;
        let alteredNote: string;
        if (chordInfo["seventh"] === "b")
            alteredNote = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(completedChord[3])-1+12)%12];
        else
            alteredNote = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(completedChord[3])+1)%12];

        completedChord[3] = alteredNote;
    }
    
    // Do inversions last bc its the same for all the different chord types
    // And it just rearranges the already built chord to change which note is in the bass
    let invertNum = 0; // How many times to pop the front note and push it

    // These numbers are based on music theory
    // No idea why they are what they are
    switch (chordInfo["inversion"])
    {
        case "6":
        case "65":
            invertNum = 1;
            break;

        case "64":
        case "43":
            invertNum = 2;
            break;

        case "42":
            invertNum = 3;
            break;

        default:
            break;
    }

    // Invert the chord accordingly by just popping the first element and pushing
    // it to the end of the chord however many times specified
    for (let i = 0; i < invertNum; i++)
    {
        let poppedNote: string | undefined = completedChord.shift();
            
        if (poppedNote != undefined)
            completedChord.push(poppedNote);       
    }

    return completedChord;
}

// Master function to generate the entire chord progression
// Returns a list of <ChordButton/>s containing all the chord info,
// ready to be interacted with :)
export async function genProgression(currentState: React.JSX.Element[], formData: FormData)
{
    // Gather Data from form
    const keyNote: string = formData.get("note") as string;
    const keyAccidental: string = formData.get("accidental") as string;
    const keyMode: string = formData.get("mode") as string;
    const length: number = parseInt(formData.get("length") as string); // How many chords to generate
    
    // Determine (semi) random starting chord
    const posStartChords: string[][] = STARTING_CHORDS[keyMode];
    const startingChord = posStartChords[Math.floor(Math.random()*posStartChords.length)];
    
    // These will start with one chord in them 
    // whatever the starting chord is determined to be
    let chordProgression: string[] = [startingChord[0]];
    let currChildPath: string = startingChord[1]; // Childpath for API

    let key: string = determineKey(keyNote, keyAccidental, keyMode);

    // Generate a likely chord based on API data
    // Adds each new chord to the childpath and the current Chord Progression
    for (let i = 1; i < length; i++)
    {   
        let data = null;
        
        try {
            data = await fetchChords(currChildPath);
        } catch (error) {
            console.log(error);
            return [<ChordGenError key="1"/>];
        }

        // Choose random chord from the first half of the returned chords
        // This is just to cut off the chords that rarely follow the current childpath
        let nextChord = data[Math.floor(Math.random()*(Math.floor(data.length/2)))];

        chordProgression.push(nextChord["chord_HTML"]);
        currChildPath = nextChord["child_path"];
        
        // For larger chord progressions, the API will return NULL the more chords
        // in the childpath. To fix this, there will never be more than 4. We achieve
        // this by popping the first chord each time off after reaching 4 chords
        if (i > 3)
            currChildPath = currChildPath.slice(currChildPath.indexOf(',')+1);
    }

    let chordsParsed: {[Key: string]: any}[] = [];
    
    // Go through and parse each chord given by the API as they are
    // given in roman numeral notation, which is unintuitive without
    // music theory knowledge. 
    // This is helpful to determine which notes are in the scale
    // based on the predetermined key.
    for (let chordNumeral of chordProgression)
        chordsParsed.push(parseNumeral(chordNumeral));
    
    // After parsing, now we have to determine what notes are in the chord
    let chordProgressionNotes: string[][] = [] //  <- final chords
    
    for (let chordInfo of chordsParsed)
        chordProgressionNotes.push(buildChord(key, chordInfo));

    // Now that the chords are built, we will use an external library 'Tonal' to detect
    // the names of the chords - useful for the ScalesChords API, which can send audio of the
    // chord if we POST the name of it
    let chordDetections: string[] = [];
    let chordImages: React.JSX.Element[] = [];

    let keyNum: number = 1; // To give each <ChordButton/> a key
    for (let c of chordProgressionNotes)
    {
        chordDetections = Chord.detect(c);

        if (chordDetections.length != 0)
        {
            let chosenChordIndex: number = 0;
            
            // Sometimes it will detect multiple possible chord names,
            // we search for the one that matches the root of the chord
            for (let detection of chordDetections)
            {
                if (detection.slice(0, 2).indexOf(c[0]) != -1)
                {
                    chosenChordIndex = chordDetections.indexOf(detection);
                    break;
                }
            }

            // Replace M with Maj for the ScalesChords API, as it doesn't differentiate 'M' and 'm'
            let detectedChord = chordDetections[chosenChordIndex].replace("M", "Maj");
            
            let chordMediaData: string = "";

            try {
                chordMediaData = await fetchChordMedia(detectedChord, "sound");
            } catch (error) {
                console.log(error);
                return [<ChordGenError key="1"/>];
            }

            // Slice the audio link from the result of the ScalesChords API
            const chordAudioSrcOgg = chordMediaData.slice(chordMediaData.indexOf("src=")+5, chordMediaData.indexOf("type=")-2);
            //const chordAudioSrcMp3 = chordMediaData.slice(chordMediaData.indexOf("src=", chordMediaData.indexOf("type="))+5, chordMediaData.indexOf("type=", chordMediaData.indexOf("type=")+1)-2);
            
            chordImages.push(<ChordButton key={keyNum} audioUrl={chordAudioSrcOgg} chordName={detectedChord} notes={c}/>);
            keyNum += 1;
        }
    }

    return chordImages;
}