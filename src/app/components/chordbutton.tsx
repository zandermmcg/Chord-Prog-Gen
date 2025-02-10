"use client";

export default function ChordButton({audioUrl}:{audioUrl: string})
{
    const playAudio = (src:string) =>
    {
        const sound = new Audio(src);
        sound.play();
    };
    
    return (
        <div>
            <audio src={audioUrl}></audio>
            <button onClick={() => playAudio(audioUrl)}>Play Chord</button>
        </div>
    );
}