const axios = require("axios");
const fs = require("fs");

class Busquedas {
    historial = [];
    long = "";
    lat = "";
    dbPath = "./db/database.json";

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map((lugar) => {
            let palabras = lugar.split(" ");
            palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

            return palabras.join(" ");
        });
    }

    get paramsMapBox() {
        return {
            access_token: process.env.MAPBOX,
            language: "es",
            limit: 5,
        };
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPEN_WEATHER,
            lat: this.lat,
            lon: this.long,
            units: "metric",
            lang: "es",
        };
    }

    // Esto se puede omitir, pero se agrego para probar los setters
    set _long(long) {
        this.long = long;
    }

    set _lat(lat) {
        this.lat = lat;
    }

    async ciudad(ciudad = "") {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ciudad}.json`,
                params: this.paramsMapBox,
            });

            const resp = await instance.get();

            return resp.data.features.map((item) => ({
                id: item.id,
                nombre: item.place_name,
                lng: item.center[0],
                lat: item.center[1],
            }));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async climaPorLugar({ lat, lng }) {
        try {
            this._long = lng;
            this._lat = lat;

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: this.paramsOpenWeather,
            });

            const resp = await instance.get();
            const { main, weather } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            };
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    agregarHistorial(lugar = "") {
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        this.historial.unshift(lugar.toLocaleLowerCase());
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial,
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {
        const data = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
        if (data) {
            let db = JSON.parse(data);
            this.historial = db.historial;
        }
    }
}

module.exports = Busquedas;
