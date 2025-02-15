"use client";

import styles from './css/chordgenerror.module.css';

// Cool error message module if anything goes wrong w/the APIs
export default function ChordGenError()
{
    return (
        <div className={styles.container}>
            There was an error generating chord progression.
            <br></br>
            Please try again later.
        </div>
    )
}