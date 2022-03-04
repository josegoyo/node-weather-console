require("dotenv").config();
const colors = require("colors");

const { leerInput, inquirerMenu, pausa, listadoDeLugares, agregarHistorial } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    console.log("process.env", process.env.MAPBOX);

    let opt;
    const busquedas = new Busquedas();

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                const ciudad = await leerInput("Ciudad");
                const lugares = await busquedas.ciudad(ciudad);

                const id = await listadoDeLugares(lugares);
                if (id === "0") continue;

                const lugarSeleccionado = lugares.find((l) => l.id === id);

                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                const clima = await busquedas.climaPorLugar(lugarSeleccionado);

                // Resultado
                console.clear();
                console.log("\nInformacion de la ciudad\n".green);
                console.log("Ciudad:", lugarSeleccionado.nombre);
                console.log("Lat:", lugarSeleccionado.lat);
                console.log("Long:", lugarSeleccionado.lng);
                console.log("Temperatura:", clima.temp);
                console.log("Mimina:", clima.min);
                console.log("Maxima", clima.max);
                console.log("El clima se ve: ", clima.desc);
                break;

            case 2:
                busquedas.historialCapitalizado.forEach((item, pos) => {
                    let idx = `${pos + 1}`.green;
                    console.log(`${idx} ${item}`);
                });
                break;
        }

        if (opt !== 0) await pausa();
    } while (opt !== 0);
};

main();
