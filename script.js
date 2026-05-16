
async function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("weatherForecast");
  const city = cityInput.value.trim();

  if (!city) {
    resultDiv.innerHTML = "⚠️ Please enter a city.";
    return;
  }

  resultDiv.innerHTML = "⏳ Loading...";
  if (forecastDiv) forecastDiv.innerHTML = "";
  cityInput.disabled = true;

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`),
      fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}&type=forecast`)
    ]);

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    if (weatherData.cod !== 200) {
      resultDiv.innerHTML = `⚠️ ${weatherData.message || "City not found."}`;
      cityInput.disabled = false;
      cityInput.focus();
      return;
    }

    const { name, main, weather, sys } = weatherData;
    const countryFlag = getCountryFlag(sys.country);
    resultDiv.innerHTML = `
      <strong style="font-size: 1.3em;">${countryFlag} ${name}</strong><br>
      🌡️ Temperature: ${Math.round(main.temp)}°C<br>
      💧 Humidity: ${main.humidity}%<br>
      💨 Wind: ${Math.round(weatherData.wind.speed * 3.6)} km/h<br>
      🌤️ Condition: ${weather[0].description}<br>
      🌍 Country: ${sys.country}
    `;

    if (forecastDiv && forecastData.cod === 200) {
      const dailyForecast = groupForecastByDay(forecastData.list);
      forecastDiv.innerHTML = `
        <h3 style="color: #ff66cc; margin-top: 30px;">📅 5-Day Forecast</h3>
        <div class="forecast-container">
          ${dailyForecast.map(day => `
            <div class="forecast-card">
              <strong>${day.date}</strong><br>
              ${day.icon}<br>
              🌡️ ${Math.round(day.temp.max)}° / ${Math.round(day.temp.min)}°<br>
              <span style="font-size: 0.85em;">${day.description}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = "⚠️ Network error. Check connection and try again.";
  } finally {
    cityInput.disabled = false;
    cityInput.focus();
  }
}

function groupForecastByDay(list) {
  const daily = {};
  
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    if (!daily[date]) {
      daily[date] = {
        date,
        temp: { min: item.main.temp_min, max: item.main.temp_min },
        icons: [],
        descriptions: []
      };
    }
    daily[date].temp.min = Math.min(daily[date].temp.min, item.main.temp_min);
    daily[date].temp.max = Math.max(daily[date].temp.max, item.main.temp_max);
    daily[date].icons.push(item.weather[0].icon);
    daily[date].descriptions.push(item.weather[0].description);
  });

  const mostCommon = arr => arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop();
  const iconMap = { '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️', '03d': '☁️', '03n': '☁️', 
                    '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
                    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️' };

  return Object.values(daily).slice(0, 5).map(day => ({
    ...day,
    icon: iconMap[mostCommon(day.icons)] || '🌤️',
    description: mostCommon(day.descriptions)
  }));
}

function getCountryFlag(countryCode) {
  const codePoints = [...countryCode].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

document.getElementById("cityInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    getWeather();
  }
});
