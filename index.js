import express from "express";
import axios from "axios"; // Fixed import
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true })); 

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Weather route
app.post('/weather', async (req, res) => {
    const location = req.body.location;
    const apiKey = '';; 
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        const weatherData = response.data;
        const willRainTomorrow = checkIfRainTomorrow(weatherData);
        res.render('index', { willRainTomorrow, location });
    } catch (error) {
        console.error(error);
        res.render('index', { error: 'Error fetching weather data. Please try again.' });
    }
});

// Function to check if it will rain tomorrow
function checkIfRainTomorrow(weatherData) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    const tomorrowForecasts = weatherData.list.filter(forecast => {
        return forecast.dt_txt.startsWith(tomorrowDateString);
    });

    return tomorrowForecasts.some(forecast => forecast.weather[0].main === 'Rain');
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});