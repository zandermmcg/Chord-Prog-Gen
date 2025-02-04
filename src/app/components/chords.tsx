"use client";
import { useActionState } from 'react';
import { genProgression } from '../genprogression';

export default function Chords()
{
    const [data, fetch, isPending] = useActionState(genProgression, null);

    return (
        <form action={fetch}>
            <h1>Data from API</h1>
            <button type="submit">Generate Chords</button>
            {isPending ? "Loading...": <pre>{JSON.stringify(data, null, 2)}</pre>}
        </form>
    );
}