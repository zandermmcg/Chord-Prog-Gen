"use server";

export async function fetchChordMedia(chord: string, type: string)
{
    const URL = "https://www.scales-chords.com/api/scapi.1.3.php";
    const requestOptions = 
    {
        method: "POST",
        headers: 
        {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(
        {
            "chord": chord,
            "instrument": "piano",
            "output": type
        }).toString()
    }

    const response = await fetch(URL, requestOptions);
    const data = await response.text();
    const dataHTML = data.split("###RAWR###")[2];

    console.log(dataHTML);
    
    return dataHTML;
}