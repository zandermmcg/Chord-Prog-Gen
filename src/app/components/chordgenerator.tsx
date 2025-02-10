"use client";
import { useActionState } from 'react';
import { genProgression } from '../genprogression';
import ChordButton from './chordbutton';

//<div dangerouslySetInnerHTML={{ __html: data }} />

export default function ChordGenerator()
{
    const [data, fetch, isPending] = useActionState(genProgression, []);

    // const submitForm = (event: React.FormEvent<HTMLFormElement>) => 
    // {
    //     const formData = new FormData(event.currentTarget);
    //     const params = 
    //     {
    //         note: formData.get("note") as string,
    //         accidental: formData.get("accidental") as string,
    //         mode: formData.get("mode") as string
    //     }

    //     fetch(params);
    // }

    return (
        <div>
            <form action={fetch}>
                <h1>Data from API</h1>
                <select name="note">
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>
                <select name="accidental">
                    <option value="nat">&#9838;</option>
                    <option value="#">&#9839;</option>
                    <option value="b">&#9837;</option>
                </select>
                <select name="mode">
                    <option value="maj">Major</option>
                    <option value="min">Minor</option>
                </select>
                <input type="number" name="length" min="1" max="8" defaultValue="4"></input>
                <br/><br/>
                <button type="submit">Generate Chords</button>
                <br/><br/>
            </form>
            {isPending ? "Loading...": data}
        </div>
    );
}