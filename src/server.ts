import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { queryUsersCount, queryUsers, getUserById, createUser } from './services/user/user.service';
import axios from 'axios';   
import NodeCache from 'node-cache';
const weatherCache = new NodeCache({ stdTTL: 60 * 60 * 24}); // Cache expires in 1 day
const localizationCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7}); // Cache expires in 1 week


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


// Rotas CRUD
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    const user = await createUser(name, email);
    res.json(user);
});


app.get('/users', async (req, res) => {
    const { page, pageSize, search } = req.query;
    const searchQuery = search as string;
    const take = Number(pageSize);
    const skip = (Number(page) - 1) * Number(pageSize);

    const [usersCount, users] = await Promise.all([queryUsersCount(searchQuery), queryUsers(searchQuery, take, skip)]);

    const data = {
        values: users,
        rowCount: usersCount
    }
    res.json(data);
});


app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json(user);
});


// "iporã".normalize('NFD').replace(/[\u0300-\u036f]/g, "");

// /weather/:city
app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    const cachedData = weatherCache.get(city);

    if (cachedData) {
        console.log("Cache hit:", city);
        res.json(cachedData);
        return;
    }

    // api WeatherAPI
    try {
        // http://api.weatherapi.com/v1/current.json?key=bdc081168abc4166ab4171155250602&q=London&aqi=no
        // http://api.weatherapi.com/v1/forecast.json?key=bdc081168abc4166ab4171155250602&q=Umuarama&days=5&aqi=yes&alerts=yes
        const result = await axios.get(`http://api.weatherapi.com/v1/forecast.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: city,       // cidade
                days: 1,       // previsão do tempo para 1 dia
                aqi: 'yes',    // qualidade do ar
                alerts: 'yes'  // alertas
            }
        });

        weatherCache.set(city, result.data);

        res.json(result.data);

    } catch (error) {
        console.log(error);
        res.json({error: "Erro ao buscar a cidade"});
    }
});

app.get('/localization/cities/:uf', async (req, res) => {
    const { uf } = req.params;
    const cachedData = localizationCache.get(uf);

    if (cachedData) {
        console.log("Cache state:", uf);
        res.json(cachedData);
        return;
    }

    // api IBGE
    try {
        // cities
        const cities = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/distritos`);
        
        const citiesFiltered = cities.data.map((city: any) => {
            return {
                id: city.id,
                name: city.nome
            }
        });

        const citiesSorted = citiesFiltered.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });

        // remove  duplicates cities
        const citiesNormalized = Array.from(new Map(citiesSorted.map((item: any) => [item.name, item])).values());

        localizationCache.set(uf, citiesNormalized);
        res.json(citiesNormalized);

    } catch (error) {
        console.log(error);
        res.json({error: "Erro ao buscar o estado"});
    }
});



app.get('/localization/states', async (req, res) => {
    // api IBGE

    if (localizationCache.has("states")) {
        console.log("Cache hit: states");
        res.json(localizationCache.get("states"));
        return;
    }

    try {
        // UFs
        const states = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados`);

        const statesFiltered = states.data.map((state: any) => {
            return {
                id: state.id,
                name: state.nome,
                uf: state.sigla
            }
        });

        const statesSorted = statesFiltered.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });

        localizationCache.set("states", statesSorted);


        res.json(statesSorted);

    } catch (error) {
        console.log(error);
        res.json({error: "Erro ao buscar o estado"});
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
