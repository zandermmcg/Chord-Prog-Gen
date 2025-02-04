import { constants } from 'node:http2';
import { fetchChords } from '../app/genchords';
import { Progression } from "tonal";

// Define the chromatic scale and scale intervals for building scales
const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const INTERVALS: {[Key: string]: any} = { 
    "maj": [2, 2, 1, 2, 2, 2, 1],
    "min": [2, 1, 2, 2, 1, 2, 2]
}

// Helper function to build a scale with any given key
function generateScale(key: string) {
    const scale = [];

    // Grab the starting index of the chord from the chromatic scale
    // and determine which intervals to use based on if its major or minor
    let startIndex = CHROMATIC_SCALE.indexOf(key.slice(0,key.indexOf("m")));
    let intervals = INTERVALS[key.slice(key.indexOf("m"))];

    for (let interval of intervals) {
        scale.push(CHROMATIC_SCALE[startIndex % 12]); // Add the current note
        startIndex += interval; // Move to the next note
    }

    return scale;
}

// Generate all chords for a given scale
function generateChords(scale: string[]) {
    const chords: {[Key:number]: any} = {};

    // Generate chord for each note in the scale
    for (let i = 0; i < scale.length; i++) {
        const root = scale[i];
        const third = scale[(i + 2) % 7]; // Third of the chord
        const fifth = scale[(i + 4) % 7]; // Fifth of the chord
        const seventh = scale[(i + 6) % 7]; // Seventh of the chord (if needed)

        chords[i + 1] = {
            name: root,
            notes: [root, third, fifth],
            seventh: seventh
        };
    }

    return chords;
}

// Generate a dominant seventh chord for a given key
// **Dominant seventh chords have a flattened seventh note**
function generateDomSeventhChord(key: string)
{
    const notes: string[] = [];
    const scale = generateScale(key); // Grab the scale

    notes.push(scale[0]); // Root
    notes.push(scale[2]); // Third
    notes.push(scale[4]); // Fifth
    // Flattened Seventh (below)
    notes.push(CHROMATIC_SCALE[CHROMATIC_SCALE.indexOf(scale[6])-1]);

    return notes;
}

// Master function to generate the entire chord progression
// Returns a list of list of notes, each list is a chord
export async function genProgression(/*length: number*/)
{
    // These will start with one chord in them 
    // whatever the starting chord is determined to be
    let chordProgression = ["V<sup>6</sup><sub>5</sub>/vi"];
    let currChildPath = ""; // Childpath for API
    
    let length = 4; // How many chords to generate
    let key = "Cmaj";

    // Generate a likely chord based on API data
    // Adds each new chord to the childpath and the current Chord Progression
    for (let i = 1; i < length; i++)
    {
        continue;
        console.log(currChildPath);
        
        let data = await fetchChords(currChildPath);
        let nextChord = data[Math.floor(Math.random()*5)];

        console.log(nextChord);

        chordProgression.push(nextChord["chord_HTML"]);
        currChildPath = nextChord["child_path"];
    }

    let scale = generateScale(key);
    let allTriads = generateChords(scale);
    let numeralInfos: {[Key: string]: any}[] = []

    // Go through and parse each chord given by the API as they are
    // given in roman numeral notation, which is unintuitive without
    // music theory knowledge. 
    // This is helpful to determine which notes are in the scale
    // based on the predetermined key.
    // **RN = Roman Numeral**
    for (let chordNumeral of chordProgression)
    {
        let chordNumeralInitial = chordNumeral; // Initial RN State
        let chromAlter: string = ""; // Chromatic Alteration: flat or sharp
        let diminished: boolean = false; // Diminished: true or false
        let secondary: string = ""; // Secondary chord: if X/Y <- it would be 'X'
        let inversion = ""; // Note Inversion: will be a string of 0, 1, or 2 numbers
        let seventh: string = ""; // Seventh: if the chord should have a seventh, can be flat or sharp
        
        // Check for Flat Chromatic Alteration
        if (chordNumeral.indexOf("&#9837;") != -1)
        {
            chromAlter = "flat";
            // Slice it off of the RN
            chordNumeral = chordNumeral.slice(chordNumeral.indexOf("&#9837;") + 7);
        }
        // Check for Sharp Chromatic Alteration
        else if (chordNumeral.indexOf("&#9839;") != -1)
        {
            chromAlter = "sharp";
            // Slice it off of the RN
            chordNumeral = chordNumeral.slice(chordNumeral.indexOf("&#9839;") + 7)
        }

        // Inversion Step 1: Superscript Inversion number
        // While loop because sometimes there are more than 1 superscript inversions
        while (chordNumeral.indexOf("<sup>") != -1)
        {
            // Grab the number in between the <sup>...</sup> HTML
            let sup = chordNumeral.slice(chordNumeral.indexOf("<sup>")+5, chordNumeral.indexOf("</sup>"));

            // Sometimes exact inversion is unknown, will be handled later
            if (sup != "??") inversion += sup;
            //else inversion["??"] = "true";
            
            // Slice the inversion out of the RN
            chordNumeral = chordNumeral.slice(0, chordNumeral.indexOf("<sup>"))
                         + chordNumeral.slice(chordNumeral.indexOf("</sup>")+6);
        }

        // Inversion Step 2: Subscript Inversion Number
        // Unknown if there can be multiple subscript inv, while loop just in case
        while (chordNumeral.indexOf("<sub>") != -1)
        {
            // Grab the number in between the <sub>...</sub> HTML
            let sub = chordNumeral.slice(chordNumeral.indexOf("<sub>")+5, chordNumeral.indexOf("</sub>"));

            inversion += sub;
            
            // Slice the inversion out of the RN
            chordNumeral = chordNumeral.slice(0, chordNumeral.indexOf("<sub>"))
                            + chordNumeral.slice(chordNumeral.indexOf("</sub>")+6);
        }

        // Check for diminished
        if (chordNumeral.indexOf("&deg;") != -1)
        {
            diminished = true;
            
            // Slice it out of the RN
            chordNumeral = chordNumeral.slice(0, chordNumeral.indexOf("&deg;"))
                         + chordNumeral.slice(chordNumeral.indexOf("&deg;")+5);
        }
        
        // Check for secondary Chord
        if (chordNumeral.indexOf("/") != -1)
        {
            // Grab the chord before the '/'
            secondary = chordNumeral.slice(0, chordNumeral.indexOf("/"))
            
            // Slice the chord before the '/'
            chordNumeral = chordNumeral.slice(chordNumeral.indexOf("/")+1);
        }

        // Check for seventh
        if (chordNumeral.indexOf("7") != -1)
        {
            let charBefore = chordNumeral.charAt(chordNumeral.indexOf("7")-1);
            
            // Check if its a flat or sharp seventh, if so slice it out with the '7'
            if(charBefore === "b" || charBefore === "#")
            {
                seventh = chordNumeral.slice(chordNumeral.indexOf("7")-1);
                chordNumeral = chordNumeral.slice(0, chordNumeral.indexOf("7")-1);
            }
            else
            {
                seventh = "7";
                chordNumeral = chordNumeral.slice(0, chordNumeral.indexOf("7"));
            }
        }

        numeralInfos.push({
            "numeral": chordNumeral,
            "numeral_initial": chordNumeralInitial,
            "inversion" : inversion,
            "diminished": diminished,
            "chrom_alteration": chromAlter,
            "secondary": secondary,
            "seventh": seventh
        });
    }

    const romanMap: {[Key: string]: number} = {
        "i": 1,
        "ii": 2,
        "iii": 3,
        "iv": 4,
        "v": 5,
        "vi": 6,
        "vii": 7
    }
    
    // After parsing, now we have to determine what notes are in the chord
    let chordProgressionNotes: string[][] = [] //  <- final chords
    
    for (let chordInfo of numeralInfos)
    {
        //continue;
        
        // Start by grabbing the chord note info
        const numeralInt = romanMap[chordInfo["numeral"].toLowerCase()]; // base numeral->int
        let chordNoteInfo = allTriads[numeralInt]; // chord for the base numeral
        
        // We are gonna start with that chord, might change depending on how wacky
        // the chord is.
        let completedChord: string[] = chordNoteInfo.notes;
        
        // First check the inversion, bc sometimes that will determine that
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
        
        // Build the chord based on the numeral info
        // Secondary is first because that completely changes how we build the chord
        if (chordInfo["secondary"] != "")
        {
            const majorChordKeys = ["maj", "min", "min", "maj", "maj", "min", "dim"];
            const minorChordKeys = ["min", "dim", "maj", "min", "min", "maj", "maj"];
            const secondaryNumeralInt = romanMap[chordInfo["secondary"].toLowerCase()];
            
            let root: string = chordNoteInfo.name;

            let chordKeys: string[];
            if (key.slice(key.indexOf("m")) === "maj")
                chordKeys = majorChordKeys;
            else
                chordKeys = minorChordKeys;
            
            root += chordKeys[numeralInt-1];

            if ((chordInfo["secondary"].toLowerCase() === chordInfo["secondary"]
                && chordKeys[secondaryNumeralInt-1] === "min") 
             || (
                chordInfo["secondary"].toLowerCase() !== chordInfo["secondary"]
                && chordKeys[secondaryNumeralInt-1] === "maj"))
            {
                console.log("Case 1");

                console.log(root);

                let secondaryChord = generateChords(generateScale(root))[secondaryNumeralInt];
                completedChord = secondaryChord.notes;
                completedChord.push(secondaryChord.seventh);
            }
            else
            {
                console.log("Case 2");
                let dominantKey;
                if (chordInfo["secondary"].toLowerCase() === chordInfo["secondary"])
                    dominantKey = "min";
                else dominantKey = "maj";

                console.log(root);
                let secondaryChordName = generateChords(generateScale(root))[secondaryNumeralInt].name;
                console.log(secondaryChordName + dominantKey);
                completedChord = generateDomSeventhChord(secondaryChordName + dominantKey);
            }
            
        }
        else
        {
            if (chordInfo["seventh"] != "")
                completedChord.push(chordNoteInfo.seventh);
            
        }

        
        // Do inversions last bc its the same all the different chord types
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

        chordProgressionNotes.push(completedChord);
    }

    return chordProgressionNotes;
}