"use client";

export default function ChordPlayer()
{
    let sound = new Audio('../../../public/audio/piano-mp3/C3.mp3');
    
    const playAudio = () => {
        sound.play();
    }

    return (
        <div>
            <button onClick={playAudio}>Play Chord</button>
        </div>
    )
}