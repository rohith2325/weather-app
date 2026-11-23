const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        cityName.textContent = "Please enter a city name!";
        temperature.textContent = "🌡️ Temperature: --°C";
        description.textContent = "☁️ Weather: --";
        humidity.textContent = "💧 Humidity: --%";
        windSpeed.textContent = "💨 Wind Speed: -- km/h";
        return;
    }

    try {
        // Show loading message
        cityName.textContent = "Loading...";
        temperature.textContent = "";
        description.textContent = "";
        humidity.textContent = "";
        windSpeed.textContent = "";

        // Find the latitude and longitude of the city
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results) {
            cityName.textContent = "City not found!";
            return;
        }

        const location = locationData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Display weather information
        cityName.textContent = location.name;
        temperature.textContent =
            `🌡️ Temperature: ${current.temperature_2m}°C`;
        humidity.textContent =
            `💧 Humidity: ${current.relative_humidity_2m}%`;
        windSpeed.textContent =
            `💨 Wind Speed: ${current.wind_speed_10m} km/h`;
        description.textContent =
            `☁️ Weather: ${getWeatherDescription(current.weather_code)}`;

    } catch (error) {
        cityName.textContent = "Something went wrong!";
        temperature.textContent = "Please try again.";
        description.textContent = "";
        humidity.textContent = "";
        windSpeed.textContent = "";
        console.error(error);
    }
}

// Convert weather codes into understandable weather descriptions
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        80: "Rain Showers",
        81: "Moderate Rain Showers",
        82: "Heavy Rain Showers",
        95: "Thunderstorm"
    };

    return weatherCodes[code] || "Unknown";
}

// Search when the button is clicked
searchBtn.addEventListener("click", getWeather);

// Search when Enter is pressed
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});