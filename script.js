async function fetchWeather() {
    let searchInput = document.getElementById("search").value.trim();
    const weatherDataSection = document.getElementById("weather-data");
    const apiKey = "0c217f5066b9271bea061bcd3c02b347";

    weatherDataSection.style.display = "block";
    weatherDataSection.classList.remove("show");

    if (searchInput === "") {
        weatherDataSection.innerHTML = `
            <div>
                <h2>Empty Input!</h2>
                <p>Please try again with a valid <u>city name</u>.</p>
            </div>
        `;
        weatherDataSection.classList.add("show");
        return;
    }

    // 1. Get lon & lat
    const geocodeData = await getLonAndLat(searchInput, apiKey);
    if (!geocodeData) {
        weatherDataSection.innerHTML = `
            <div>
                <h2>Invalid Input: "${searchInput}"</h2>
                <p>Please try again with a valid <u>city name</u>.</p>
            </div>
        `;
        weatherDataSection.classList.add("show");
        return;
    }

    // 2. Get weather data
    const weather = await getWeatherData(geocodeData.lon, geocodeData.lat, apiKey);
    if (!weather) {
        weatherDataSection.innerHTML = `
            <div>
                <h2>Error fetching weather data!</h2>
                <p>Please try again later.</p>
            </div>
        `;
        weatherDataSection.classList.add("show");
        return;
    }

    // 3. Display weather
    weatherDataSection.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}" width="100" />
        <div>
            <h2>${weather.name}</h2>
            <p><strong>Temperature:</strong> ${Math.round(weather.main.temp - 273.15)}&deg;C</p>
            <p><strong>Description:</strong> ${weather.weather[0].description}</p>
        </div>
    `;

    // 4. Fade-in
    setTimeout(() => {
        weatherDataSection.classList.add("show");
    }, 50);

    // 5. Backround change by weather
    const mainWeather = weather.weather[0].main.toLowerCase();
    document.body.className = ""; // resetează clasele vechi
    if (["clear", "sun"].includes(mainWeather)) document.body.classList.add("sun");
    else if (["rain", "drizzle", "thunderstorm"].includes(mainWeather)) document.body.classList.add("rain");
    else if (["clouds", "mist", "fog"].includes(mainWeather)) document.body.classList.add("clouds");

    // Temperature color change
    const tempC = Math.round(weather.main.temp - 273.15);
    const tempElement = weatherDataSection.querySelector("p strong");
    if (tempC < 10) tempElement.style.color = "blue";
    else if (tempC < 25) tempElement.style.color = "orange";
    else tempElement.style.color = "red";

    document.getElementById("search").value = "";
}

async function getLonAndLat(city, apiKey) {
    const countryCode = 40;
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city.replace(" ", "%20")},${countryCode}&limit=1&appid=${apiKey}`;
    const response = await fetch(geocodeURL);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    return { lon: data[0].lon, lat: data[0].lat };
}

async function getWeatherData(lon, lat, apiKey) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(weatherURL);
    if (!response.ok) return null;

    const data = await response.json();
    return data;
}
