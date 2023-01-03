# The Spotify Fan Destroyer

This project is part of the master thesis *Fun*ctional - Fun in User Interfaces. This website was created as the practial part and uses:

- [Spotify Web API] (https://developer.spotify.com/documentation/web-api/)
- [Astro](https://astro.build)
- HTML, CSS, JS (no Frameworks)

The quiz can be played here:

Or cloned and run locally with a few adjustments.

## Running locally

In order to run this project locally you need to:

- clone the repository (and open it)
- `pnpm install`
- create an app in the spotify developer dashboard and set your redirectUri to http://localhost:3000
  https://developer.spotify.com/dashboard/applications
  https://developer.spotify.com/documentation/general/guides/authorization/app-settings/
- change the variable redirectUri to http://localhost:3000
- change the variable clientId to the one provided in your spotify app in the developer dashboard
- `pnpm run dev`

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

With few exceptions the code was written by me, Jannis Paul Wicke.

- The authorization code was created as part of a previous university project: `setAccessToken(), authorize(), fetchJSONFromSpotify()`
- Fisher yates algorithm to randomly shuffle an array: https://javascript.info/array-methods#shuffle-an-array
- Algorithm to filter an array for objects with equal properties:https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep#comment-8hdm
- Function to parse a string to HTML: https://gomakethings.com/converting-a-string-into-markup-with-vanilla-js/
