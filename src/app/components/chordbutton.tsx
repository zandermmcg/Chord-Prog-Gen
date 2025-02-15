"use client";

import styles from './css/chordbutton.module.css';

interface ChordButtonProps {
    audioUrl: string,
    chordName: string,
    notes: string[]
}

// Module for a generated chord. Represented in a rounded square containing the name
// of the chord, the notes in it, and a button to play the chord audio.
export default function ChordButton({audioUrl, chordName, notes}: ChordButtonProps)
{
    const playAudio = (src:string) =>
    {
        const sound = new Audio(src);
        sound.play();
    };

    // To implement if I want to utilize the images that the ScalesChord API
    // can send. They are not that good quality, which is why this isn't super
    // important, especially considering the notes in the chord are given already.
    const showImage = () =>
    {

    };
    
    return (
        <div className={styles.chord_module}>
            <h2 className={styles.chord_title}>{chordName}</h2>
            <div className={styles.chord_notes}>
                {notes.join(" • ")}
            </div>
            <div className={styles.chord_buttons}>
                <audio src={audioUrl}></audio>
                <button className={styles.chord_button} onClick={() => playAudio(audioUrl)}>	
                    &#9834; Play &#9834;
                </button>
                {/*<button className={styles.chord_button} onClick={() => showImage()}>Show Image</button>*/}
            </div>
        </div>
    );
}