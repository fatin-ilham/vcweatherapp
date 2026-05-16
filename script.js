
async function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const resultDiv = document.getElementById("weatherResult");
  const city = cityInput.value.trim();

  if (!city) {
    resultDiv.innerHTML = "⚠️ Please enter a city.";
    return;
  }

  resultDiv.innerHTML = "⏳ Loading...";
  cityInput.disabled = true;

  try {
    const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (data.cod !== 200) {
      resultDiv.innerHTML = `⚠️ ${data.message || "City not found."}`;
      cityInput.disabled = false;
      cityInput.focus();
      return;
    }

    const { name, main, weather, sys } = data;
    const countryFlag = getCountryFlag(sys.country);
    resultDiv.innerHTML = `
      <strong style="font-size: 1.3em;">${countryFlag} ${name}</strong><br>
      🌡️ Temperature: ${Math.round(main.temp)}°C<br>
      💧 Humidity: ${main.humidity}%<br>
      💨 Wind: ${Math.round(data.wind.speed * 3.6)} km/h<br>
      🌤️ Condition: ${weather[0].description}<br>
      🌍 Country: ${sys.country}
    `;
  } catch (err) {
    resultDiv.innerHTML = "⚠️ Network error. Check connection and try again.";
  } finally {
    if (!cityInput.disabled) {
      cityInput.disabled = false;
      cityInput.focus();
    }
  }
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
