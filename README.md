# Universe Explorer (3D)

A browser-based 3D universe exploration prototype built with Three.js.

## Features
- Spaceship-style navigation in a 3D star field.
- Celestial bodies including star(s), planets, asteroid, and black hole.
- Proximity-based information panel (details appear when you fly near a body).
- Target selector + guidance path line from ship to destination.
- Autopilot mode to travel to selected body.
- Performance-minded rendering choices (single WebGL renderer, point-based starfield, fog, capped DPR).

## Run locally
Because this app uses JavaScript ES modules, serve it with a local static server.

```bash
python -m http.server 4173
```

Open: http://localhost:4173

## Controls
- `W/A/S/D` move
- `Space` up
- `Shift` down
- Hold right mouse button + move mouse to look around
- `Left Ctrl` boost
- `G` toggle autopilot
- Select a destination and click **Set Target** for route guidance.

## Notes
This is a scalable foundation. To cover broader known catalogs (exoplanets, stellar catalogs, asteroids), plug in paged/streamed data and chunked spatial loading to avoid rendering all bodies at once.
