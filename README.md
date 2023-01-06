# The Spotify Fan Destroyer

This project is part of the master thesis **Fun**ctional - Fun in User Interfaces. This website was created as the practial part and uses:

## ️Warnin️g️ ⚠

In order to play the quiz you need a **spotify account** and your account **email needs to be added** to the spotify developer dashboard. Please contact <wicke@th-brandenburg.de> to get access.

Once you have access, the quiz can be played here: <https://spotify-fan-destroyer.netlify.app>

## Tech stack

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Astro](https://astro.build)
- HTML, CSS, JS (no Frameworks)

## Running locally

In order to run this project locally you need to:

- Have a spotify account
- Clone the repository (and open it)
- Run `pnpm install` in the repository
- Create an app in the [spotify developer dashboard](https://developer.spotify.com/dashboard/applications)
- Copy the `client id`
- Edit settings and set your redirectUri to `https://localhost:3000`. More info: <https://developer.spotify.com/documentation/general/guides/authorization/app-settings/>
- Open the file `.env.development`
- change the variable `PUBLIC_CLIENT_ID` to the client id provided in your spotify app in the developer dashboard
- Run `pnpm run astro dev`

## Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                 | Action                                             |
| :---------------------- | :------------------------------------------------- |
| `pnpm install`          | Installs dependencies                              |
| `pnpm run astro dev`    | Starts local dev server at `localhost:3000`        |
| `pnpm run build`        | Build your production site to `./dist/`            |
| `pnpm run preview`      | Preview your build locally, before deploying       |
| `pnpm run astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `pnpm run astro --help` | Get help using the Astro CLI                       |

## Credit

The code was mostly written by me, Jannis Paul Wicke specifically for this project.
Here are the exceptions and sources the code ist from. All sources are also in the code itself.

- The authorization code was created as part of a previous university project: `setAccessToken(), authorize(), fetchJSONFromSpotify()`
- Fisher yates algorithm to randomly shuffle an array: https://javascript.info/array-methods#shuffle-an-array
- Algorithm to filter an array for objects with equal properties:https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep#comment-8hdm
- Function to parse a string to HTML: https://gomakethings.com/converting-a-string-into-markup-with-vanilla-js/
- Confetti effect when full points are achieved: https://github.com/catdad/canvas-confetti
