# Chordify - Chord Progression Generator by Zander McGinley

## Project Description

Chordify is a Full Stack Web Application Chord Progression Generator. It was built using React.js and Next.js, several public APIs, and a Javascript music theory library.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Motivation

As a self-taught music producer by night, I have always struggled with the first part of making beats: finding the right chord progression. With little-to-no music theory knowledge, my strategies for developing chord progressions have been limited to scrounging the internet for premade progressions that don't sound half-bad. While this isn't a horrible strategy outright, I knew that I needed a way to 

With the creation of Chordify, I have been able to generate entire chord progressions at the click of a few buttons. If I don't like what I get, I can simply regenerate using the same key or another. Building this project has also brought me another 

## Challenges

The amount of music theory knowledge necessary for this project turned out to be much more than anticipated.

## What's next?

In the future, I am hoping to deploy this project so that others can enjoy what has saved me so many headaches in my music-producing endeavors. Before I do this, I am hoping to implement and change a few more things to ensure that this project is in the best shape it can be. Some of these things include:

- Chord image displays
- 'About' page on the website
- Improving the project structure
- Alternative chord audio sources

Needless to say, Chordify should be up and running in no time! I am hoping that this project can make a difference for others like me who want to start making music, but don't have a ton of prior music theory knowledge.

## Website Preview

## Running this Project

To see and use this project for yourself, you can run this project locally on your device. First, ensure that you have downloaded the latest version of Node.js. You can check this by running `node -v`. If you don't, you can install it from the [Node.js official site](https://nodejs.org/en/download). Next, clone this repository onto your device and navigate to the project directory. Then, run

```bash
npm install
```

to install the required dependencies.

You will need to obtain an API Key from HookTheory to access their API. You can do this for free by creating an account at [https://www.hooktheory.com/signup](https://www.hooktheory.com/signup). Once created, navigate to [https://www.hooktheory.com/api/trends/docs](https://www.hooktheory.com/api/trends/docs), where you will learn how to obtain your HTTP Bearer Token in the Authentication section of the webpage. Once you have retrieved your token, create a `.env` file in the project directory and add your key like so:

```
API_KEY=YOUR_API_KEY
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Known Issues

When playing chord audios, audible crackling sounds can be heard about 45% of the time. This is due to the API used to retrieve these audio links. A solution for this problem would be to implement a different strategy for playing chord audios other than the API, which will be done in the near future.

## Credits

[HookTheory API](https://www.hooktheory.com/api/trends/docs) - This API is responsible for the likely next chord data.

[Scales-Chords API](https://www.scales-chords.com/api/#reference) - This API is responsible for the chord audio that can be played on the website.

[Tonal Library - Chord Detection](https://github.com/tonaljs/tonal/tree/main/packages/chord-detect)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can also check out [the Next.js GitHub repository](https://github.com/vercel/next.js).
