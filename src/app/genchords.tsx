"use server";

export async function fetchChords(childpath: string) 
{
    const KEY = process.env.AUTH;
    const requestOptions = 
    {
        method: "GET",
        headers: 
        {
            Authorization: `Bearer ${KEY}`
        }
    }

    const URL = "https://api.hooktheory.com/v1/trends/nodes?cp=" + childpath;

    const response = await fetch(URL, requestOptions);
    const data = await response.json();

    return data;
}