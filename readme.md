# OBS Plexamp Now Playing
Reads now playing information from Plex server, designed for music use through Plexamp. Output in text, html or image as desired.

## Setup
1. Copy `config/~settings.js` to `config/settings.js` and update it with details specific to your situation.
2. Run `npm install` for node dependencies.
3. Run application using `nowplaying.cmd` (very helpful for situations like a Stream Deck) or navigate to the application directory and run `node index.js`.
4. Point OBS source to the desired file in the `output` directory.

### Customization
`assets/output-template.html` can be extensively customized with your own html and css. The application uses the variables in brackets `{{}}` for data, so modifying these should be avoided.