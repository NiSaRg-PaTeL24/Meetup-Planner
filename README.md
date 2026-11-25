# 🚗 Meetup Planner

Find out how long each friend's drive will be to a shared meeting spot. Add four or more friends, pin a destination, and see every route and drive time on one map.

**🔗 Live demo:** [https://dulcet-raindrop-600796.netlify.app/](https://dulcet-raindrop-600796.netlify.app/)

[![Open Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-2563eb?style=for-the-badge)](https://dulcet-raindrop-600796.netlify.app/)

<!-- Add a screenshot: save it as preview.png next to this file, then uncomment the line below -->
<!-- ![Preview](preview.png) -->

## Features

- Add any number of friends with their starting locations
- Search an address or click the map to drop pins
- Set a meeting destination
- Color-coded driving routes for each friend
- Drive time per person, plus the longest and average times
- No API keys and no backend

## How to use

1. Choose **Add friend**, then search an address or click the map and enter a name. Repeat for each friend.
2. Switch to **Set destination** and drop the meeting pin.
3. Click **Calculate drive times**.

## Built with

| Purpose | Tool |
|---|---|
| Map display | [Leaflet](https://leafletjs.com/) |
| Map data and tiles | [OpenStreetMap](https://www.openstreetmap.org/) (with fallback mirrors) |
| Driving routes | [OSRM](https://project-osrm.org/) (FOSSGIS and demo servers) |
| Address search | [Photon](https://photon.komoot.io/) and [Nominatim](https://nominatim.org/) |

## Run locally

It's a single file, `index.html`. Serve it over localhost so the map servers accept the requests.

**VS Code:** install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

**Terminal:**

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.
Then open <http://localhost:8000>.

## Notes

- Travel times come from free public servers and do not include live traffic.
- Public servers have fair-use limits. For heavy traffic, host your own OSRM instance.

## Ideas for the future

- Suggest a fair meeting point that minimizes the longest drive
- Departure time and traffic estimates
- Shareable link so friends can add their own location

## License

MIT. See [LICENSE](LICENSE).

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).