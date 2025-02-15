"use client";

import { useActionState, useState } from 'react';
import { genProgression } from '../genprogression';
import Loader from './loader';
import styles from './css/chordgenerator.module.css';

// Module that encases all of the mechanisms for generating chord progressions
export default function ChordGenerator()
{
    const [data, fetch, isPending] = useActionState(genProgression, []);
    
    // These are used for the button that lets the user decide how many chords to generate
    const [value, setValue] = useState(4);
    const [hoverPosition, setHoverPosition] = useState<"top" | "bottom" | null>(null);

    // This handleClick is for that button as well
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => 
    {
        const button = event.currentTarget;
        const clickPosition = event.nativeEvent.offsetY;

        // Increment or Decrement the value based on where the mouse was on the button
        if (clickPosition < button.clientHeight / 2)
            setValue(Math.min(8, value + 1)); // Top half
        else
            setValue(Math.max(1, value - 1)); // Bottom
    };

    // This handleMouseMove is for that button as well
    // Changes the classname of the button so that the shading can be set on the
    // top or bottom of the button depending on where the mouse is
    const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => 
    {
        const button = event.currentTarget;
        const hoverPosition = event.nativeEvent.offsetY < button.clientHeight / 2 ? "top" : "bottom";
        setHoverPosition(hoverPosition);
    };

    // Reset button when mouse leaves
    const handleMouseLeave = () => 
    {
        setHoverPosition(null);
    };

    return (
        <div className={styles.chord_gen_container}>
            <form action={fetch} className={styles.chord_form}>
                <div className={styles.chord_selections}>
                    <select className={styles.select} name="note">
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                    <select className={styles.select} name="accidental">
                        <option value="nat">&#9838;</option>
                        <option value="#">&#9839;</option>
                        <option value="b">&#9837;</option>
                    </select>
                    <select className={styles.select} name="mode">
                        <option value="maj">Major</option>
                        <option value="min">Minor</option>
                    </select>
                    <div className={styles.chord_amt_wrapper}>
                        <input type="hidden" name="length" value={value}></input>
                        <button
                            className={`${styles.chord_amt_button} ${hoverPosition === "top" ? styles.top_hover : ""} ${hoverPosition === "bottom" ? styles.bottom_hover : ""}`}
                            onClick={handleClick}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            type="button" // Prevents form submission on click
                        >
                        {value}
                        </button>
                    </div>
                </div>
                <button className={styles.submit_form} type="submit" disabled={isPending}>Generate Chords</button>
            </form>
            <div className={styles.chord_container}>
                {isPending ? (<Loader/>): data}
            </div>
        </div>
    );
}