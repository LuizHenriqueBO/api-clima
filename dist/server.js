"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_service_1 = require("./services/user/user.service");
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const weatherCache = new node_cache_1.default({ stdTTL: 60 * 60 * 24 }); // Cache expires in 1 day
const localizationCache = new node_cache_1.default({ stdTTL: 60 * 60 * 24 * 7 }); // Cache expires in 1 week
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas CRUD
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    const user = yield (0, user_service_1.createUser)(name, email);
    res.json(user);
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, pageSize, search } = req.query;
    const searchQuery = search;
    const take = Number(pageSize);
    const skip = (Number(page) - 1) * Number(pageSize);
    const [usersCount, users] = yield Promise.all([(0, user_service_1.queryUsersCount)(searchQuery), (0, user_service_1.queryUsers)(searchQuery, take, skip)]);
    const data = {
        values: users,
        rowCount: usersCount
    };
    res.json(data);
}));
app.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield (0, user_service_1.getUserById)(id);
    res.json(user);
}));
// "iporã".normalize('NFD').replace(/[\u0300-\u036f]/g, "");
// /weather/:city
app.get('/weather/:city', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield axios_1.default.get(`http://api.weatherapi.com/v1/forecast.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: city, // cidade
                days: 1, // previsão do tempo para 1 dia
                aqi: 'yes', // qualidade do ar
                alerts: 'yes' // alertas
            }
        });
        weatherCache.set(city, result.data);
        res.json(result.data);
    }
    catch (error) {
        console.log(error);
        res.json({ error: "Erro ao buscar a cidade" });
    }
}));
app.get('/localization/cities/:uf', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const cities = yield axios_1.default.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/distritos`);
        const citiesFiltered = cities.data.map((city) => {
            return {
                id: city.id,
                name: city.nome
            };
        });
        const citiesSorted = citiesFiltered.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        // remove  duplicates cities
        const citiesNormalized = Array.from(new Map(citiesSorted.map((item) => [item.name, item])).values());
        localizationCache.set(uf, citiesNormalized);
        res.json(citiesNormalized);
    }
    catch (error) {
        console.log(error);
        res.json({ error: "Erro ao buscar o estado" });
    }
}));
app.get('/localization/states', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // api IBGE
    if (localizationCache.has("states")) {
        console.log("Cache hit: states");
        res.json(localizationCache.get("states"));
        return;
    }
    try {
        // UFs
        const states = yield axios_1.default.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados`);
        const statesFiltered = states.data.map((state) => {
            return {
                id: state.id,
                name: state.nome,
                uf: state.sigla
            };
        });
        const statesSorted = statesFiltered.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        localizationCache.set("states", statesSorted);
        res.json(statesSorted);
    }
    catch (error) {
        console.log(error);
        res.json({ error: "Erro ao buscar o estado" });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
//# sourceMappingURL=server.js.map