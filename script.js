const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");

  if (!city) {
    resultDiv.innerHTML = "Please enter a city.";
    return;
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},BD&appid=${apiKey}&units=metric`);
    const data = await res.json();

    if (data.cod !== 200) {
      resultDiv.innerHTML = "City not found or error fetching data.";
      return;
    }

    const { name, main, weather } = data;
    resultDiv.innerHTML = `
      <strong>${name}</strong><br>
      🌡️ Temperature: ${main.temp}°C<br>
      🌧️ Condition: ${weather[0].description}
    `;
  } catch (err) {
    resultDiv.innerHTML = "Error fetching weather data.";
  }
}
