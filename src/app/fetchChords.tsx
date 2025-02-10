"use server";

export async function fetchChords(childpath: string) 
{
    const URL = "https://api.hooktheory.com/v1/trends/nodes?cp=" + childpath;
    const KEY = process.env.AUTH;
    const requestOptions = 
    {
        method: "GET",
        headers: 
        {
            Authorization: `Bearer ${KEY}`
        }
    };

    const response = await fetch(URL, requestOptions);
    const data = await response.json();

    return data;
}