const hourlyForecast = document.getElementById("hourlyForecast");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");
const weeklyForecast = document.getElementById("weeklyForecast");

// Weather descriptions and icons
function getWeatherInfo(code) {
    const weatherTypes = {
        0: { text: "Clear Sky", icon: "☀️" },
        1: { text: "Mainly Clear", icon: "🌤️" },
        2: { text: "Partly Cloudy", icon: "⛅" },
        3: { text: "Overcast", icon: "☁️" },
        45: { text: "Foggy", icon: "🌫️" },
        48: { text: "Depositing Rime Fog", icon: "🌫️" },
        51: { text: "Light Drizzle", icon: "🌦️" },
        53: { text: "Moderate Drizzle", icon: "🌦️" },
        55: { text: "Heavy Drizzle", icon: "🌧️" },
        56: { text: "Light Freezing Drizzle", icon: "🌧️" },
        57: { text: "Heavy Freezing Drizzle", icon: "🌧️" },
        61: { text: "Light Rain", icon: "🌦️" },
        63: { text: "Moderate Rain", icon: "🌧️" },
        65: { text: "Heavy Rain", icon: "🌧️" },
        66: { text: "Light Freezing Rain", icon: "🌧️" },
        67: { text: "Heavy Freezing Rain", icon: "🌧️" },
        71: { text: "Light Snow", icon: "🌨️" },
        73: { text: "Moderate Snow", icon: "❄️" },
        75: { text: "Heavy Snow", icon: "❄️" },
        77: { text: "Snow Grains", icon: "❄️" },
        80: { text: "Rain Showers", icon: "🌦️" },
        81: { text: "Moderate Rain Showers", icon: "🌧️" },
        82: { text: "Heavy Rain Showers", icon: "⛈️" },
        85: { text: "Snow Showers", icon: "🌨️" },
        86: { text: "Heavy Snow Showers", icon: "❄️" },
        95: { text: "Thunderstorm", icon: "⛈️" },
        96: { text: "Thunderstorm with Hail", icon: "⛈️" },
        99: { text: "Heavy Thunderstorm with Hail", icon: "⛈️" }
    };

    return weatherTypes[code] || {
        text: "Unknown Weather",
        icon: "🌡️"
    };
}

function displayHourlyForecast(hourlyData) {
    hourlyForecast.innerHTML = "";

    if (!hourlyData || !hourlyData.time) {
        hourlyForecast.textContent = "Forecast unavailable.";
        return;
    }

    const currentTime = new Date();
    const currentHour = new Date(currentTime);
    currentHour.setMinutes(0, 0, 0);

    const startIndex = hourlyData.time.findIndex(time => {
        return new Date(time).getTime() >= currentHour.getTime();
    });

    if (startIndex === -1) {
        hourlyForecast.textContent = "Forecast unavailable.";
        return;
    }

    for (let i = startIndex; i < Math.min(startIndex + 6, hourlyData.time.length); i++) {
        const time = new Date(hourlyData.time[i]);
        const weather = getWeatherInfo(hourlyData.weather_code[i]);

        const hourLabel = time.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });

        const card = document.createElement("div");
        card.className = "hourly-card";

        const timeText = document.createElement("p");
        timeText.textContent = hourLabel;

        const icon = document.createElement("span");
        icon.className = "hourly-icon";
        icon.textContent = weather.icon;

        const temp = document.createElement("h3");
        temp.textContent = `${Math.round(hourlyData.temperature_2m[i])}°`;

        card.append(timeText, icon, temp);
        hourlyForecast.appendChild(card);
    }
}

function displayWeeklyForecast(dailyData) {
    weeklyForecast.innerHTML = "";

    if (!dailyData || !dailyData.time) {
        weeklyForecast.textContent = "Weekly forecast unavailable.";
        return;
    }

    dailyData.time.forEach((date, index) => {
        const weather = getWeatherInfo(dailyData.weather_code[index]);

        const dayName = new Date(date + "T12:00:00").toLocaleDateString(
            "en-US",
            { weekday: "short" }
        );

        const card = document.createElement("div");
        card.className = "weekly-card";

        const day = document.createElement("span");
        day.className = "weekly-day";
        day.textContent = index === 0 ? "Today" : dayName;

        const icon = document.createElement("span");
        icon.className = "weekly-icon";
        icon.textContent = weather.icon;

        const condition = document.createElement("span");
        condition.className = "weekly-description";
        condition.textContent = weather.text;

        const temp = document.createElement("div");
        temp.className = "weekly-temp";

        const max = Math.round(dailyData.temperature_2m_max[index]);
        const min = Math.round(dailyData.temperature_2m_min[index]);

        temp.innerHTML = `${max}° <span>${min}°</span>`;

        card.append(day, icon, condition, temp);
        weeklyForecast.appendChild(card);
    });
}

// Reset weather display
function resetWeather() {
    temperature.textContent = "--°C";
    description.textContent = "Search a city to see its weather";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    weatherIcon.textContent = "🌤️";
}

// Display loading state
function showLoading() {
    cityName.textContent = "Searching...";
    temperature.textContent = "--°C";
    description.textContent = "Getting weather information...";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    weatherIcon.textContent = "⏳";
}

// Main weather function
async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        cityName.textContent = "Enter a city name";
        resetWeather();
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    showLoading();

    try {
        // Step 1: Find city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Unable to find location.");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            cityName.textContent = "City not found";
            resetWeather();
            description.textContent = "Please check the city name and try again.";
            hourlyForecast.innerHTML = "";
            weeklyForecast.innerHTML = "";
            return;
        }

        const cityLocation = locationData.results[0];

        // Step 2: Get current, hourly and weekly weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${cityLocation.latitude}&longitude=${cityLocation.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather information is unavailable.");
        }

        const current = weatherData.current;
        const weather = getWeatherInfo(current.weather_code);

        // Step 3: Display city information
        cityName.textContent = cityLocation.name;

        if (cityLocation.country) {
            cityName.textContent += ", " + cityLocation.country;
        }

        // Step 4: Display current weather
        temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
        description.textContent = weather.text;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        windSpeed.textContent = `${current.wind_speed_10m} km/h`;
        weatherIcon.textContent = weather.icon;

        // Step 5: Display forecasts
        displayHourlyForecast(weatherData.hourly);
        displayWeeklyForecast(weatherData.daily);

    } catch (error) {
        console.error("Weather Error:", error);

        cityName.textContent = "Something went wrong";
        resetWeather();
        description.textContent = "Please check your connection and try again.";

        hourlyForecast.innerHTML = "";
        weeklyForecast.innerHTML = "";

    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

// Search button
searchBtn.addEventListener("click", getWeather);

// Search using Enter key
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});