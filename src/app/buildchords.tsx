"use server";

export async function buildChords()
{
    const model = "unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF";
    const URL = "https://api-inference.huggingface.co/models/" + model;
    const API_KEY = process.env.AI_API_KEY;

    let prompt = "Generate this chord progression in C major: [v,v<sup>7</sup>,&#9837;VI,iv]. ";
    let specs = "Only respond with a list of lists in javascript notation, where the inner lists consist of the notes in each chord."
    
    const requestOptions = 
    {
        method: "POST",
        headers:
        {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt+specs,
            parameters: {
                "max_new_tokens": 4000,
                "temperature": 0.01,
                "top_k": 50,
                "top_p": 0.95,
                "return_full_text": false
                }
        })
    };

    const response = await fetch(URL, requestOptions);
    const data = await response.json();

    return data;
}