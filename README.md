# The Spotify Fan Destroyer

This project is part of my master thesis *Fun*ctional - Fun in User Interfaces. It was created as the practial part and uses:

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
| `pnpm run dev`          | Starts local dev server at `localhost:3000`        |
| `pnpm run build`        | Build your production site to `./dist/`            |
| `pnpm run preview`      | Preview your build locally, before deploying       |
| `pnpm run astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `pnpm run astro --help` | Get help using the Astro CLI                       |
