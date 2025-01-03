const apiKey = '51710913079c8efe1dc96a377979a5ee';

document.getElementById('searchIcon').addEventListener('click', getWeather);
document.getElementById('backgroundSelect').addEventListener('change', setBackground);

async function getWeather() {
  const location = document.getElementById('userLocation').value;
  if (!location) {
    alert('Please enter a location');
    return;
  }

  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
    if (!weatherResponse.ok) throw new Error('Weather data not available');
    const weatherData = await weatherResponse.json();

    
    updateCurrentWeather(weatherData);

    
    initializeMap(weatherData.coord.lat, weatherData.coord.lon);

    
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`);
    if (!forecastResponse.ok) throw new Error('Forecast data not available');
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);

    
    const hourlyResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`);
    if (!hourlyResponse.ok) throw new Error('Hourly forecast data not available');
    const hourlyData = await hourlyResponse.json();
    displayHourlyForecast(hourlyData);

    
    const historyResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&dt=${Math.floor(Date.now() / 1000) - 86400}&appid=${apiKey}&units=metric`);
    if (!historyResponse.ok) throw new Error('Historical weather data not available');
    const historyData = await historyResponse.json();
    displayWeatherHistory(historyData);

    
    const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`);
    if (!aqiResponse.ok) throw new Error('AQI data not available');
    const aqiData = await aqiResponse.json();
    displayAQI(aqiData.list[0].main.aqi);

  } catch (error) {
    alert(error.message);
  }
}

function updateCurrentWeather(data) {
  document.querySelector('.weatherIcon').innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon" />`;
  document.querySelector('.temperature').textContent = `${data.main.temp} °C`;
  document.querySelector('.feelslike').textContent = `Feels like: ${data.main.feels_like} °C`;
  document.querySelector('.description').textContent = data.weather[0].description;
  document.querySelector('.data').textContent = `Humidity: ${data.main.humidity}% | Wind: ${data.wind.speed} m/s`;
  document.querySelector('.city').textContent = `City: ${data.name}`;

  document.getElementById('HValue').textContent = `${data.main.humidity}%`;
  document.getElementById('WValue').textContent = `${data.wind.speed} m/s`;
  document.getElementById('SRValue').textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  document.getElementById('SSValue').textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  document.getElementById('CValue').textContent = `${data.clouds.all}%`;
  document.getElementById('UValue').textContent = data.uvi || 'N/A';
  document.getElementById('PValue').textContent = `${data.main.pressure} hPa`;

  
  setWeatherBackground(data.weather[0].main.toLowerCase());
}

function displayForecast(data) {
  const forecastContainer = document.getElementById('forecastContainer');
  forecastContainer.innerHTML = '';

  data.list.forEach((forecast, index) => {
    if (index % 8 === 0) { 
      const forecastElement = document.createElement('div');
      forecastElement.classList.add('forecast-item');
      forecastElement.innerHTML = `
        <div>${new Date(forecast.dt * 1000).toLocaleDateString()}</div>
        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="weather icon" />
        <div>${forecast.main.temp} °C</div>
        <div>${forecast.weather[0].description}</div>
      `;
      forecastContainer.appendChild(forecastElement);
    }
  });
}

function displayHourlyForecast(data) {
  const hourlyContainer = document.getElementById('hourlyForecastContainer');
  hourlyContainer.innerHTML = '';

  data.list.slice(0, 24).forEach((forecast) => {
    const forecastElement = document.createElement('div');
    forecastElement.classList.add('hourly-forecast-item');
    forecastElement.innerHTML = `
      <div>${new Date(forecast.dt * 1000).toLocaleTimeString()}</div>
      <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="weather icon" />
      <div>${forecast.main.temp} °C</div>
      <div>${forecast.weather[0].description}</div>
    `;
    hourlyContainer.appendChild(forecastElement);
  });
}

function displayWeatherHistory(data) {
  const historyContainer = document.getElementById('historyForecastContainer');
  historyContainer.innerHTML = '';

  data.hourly.forEach((hourlyData) => {
    const historyElement = document.createElement('div');
    historyElement.classList.add('history-forecast-item');
    historyElement.innerHTML = `
      <div>${new Date(hourlyData.dt * 1000).toLocaleTimeString()}</div>
      <img src="http://openweathermap.org/img/wn/${hourlyData.weather[0].icon}@2x.png" alt="weather icon" />
      <div>${hourlyData.temp} °C</div>
      <div>${hourlyData.weather[0].description}</div>
    `;
    historyContainer.appendChild(historyElement);
  });
}

function displayAQI(aqi) {
  const aqiValue = document.getElementById('AqiValue');
  aqiValue.textContent = `AQI: ${aqi}`;

  let aqiText = '';
  switch (aqi) {
    case 1:
      aqiText = 'Good';
      break;
    case 2:
      aqiText = 'Fair';
      break;
    case 3:
      aqiText = 'Moderate';
      break;
    case 4:
      aqiText = 'Poor';
      break;
    case 5:
      aqiText = 'Very Poor';
      break;
  }
  aqiValue.innerHTML += ` (${aqiText})`;
}

function initializeMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([lat, lon]).addTo(map)
    .bindPopup('Current Location')
    .openPopup();
}

function setWeatherBackground(condition) {
  const body = document.body;
  switch (condition) {
    case 'clear':
      body.style.backgroundImage = "url('clearsky.jpg')";
      break;
    case 'clouds':
      body.style.backgroundImage = "url('cloudy.jpg')";
      break;
    case 'rain':
    case 'drizzle':
      body.style.backgroundImage = "url('rainy.jpg')";
      break;
    case 'thunderstorm':
      body.style.backgroundImage = "url('thunderstorm.jpg')";
      break;
    case 'snow':
      body.style.backgroundImage = "url('snowy.jpg')";
      break;
    default:
      body.style.backgroundImage = "url('default.jpg')";
      break;
  }
  body.style.backgroundSize = 'cover';
  body.style.backgroundRepeat = 'no-repeat';
  body.style.backgroundPosition = 'center';
}

function setBackground() {
  const selectedBackground = document.getElementById('backgroundSelect').value;
  const body = document.body;

  switch (selectedBackground) {
    case 'clearsky':
      body.style.backgroundImage = "url('clearsky.jpg')";
      break;
    case 'cloudy':
      body.style.backgroundImage = "url('cloudy.jpg')";
      break;
    case 'rainy':
      body.style.backgroundImage = "url('rainy.jpg')";
      break;
    case 'thunderstorm':
      body.style.backgroundImage = "url('thunderstorm.jpg')";
      break;
      case 'snow':
        body.style.backgroundImage = "url('snowy.jpg')";
        break;
      default:
        body.style.backgroundImage = "url('default.jpg')";
        break;
    }
    body.style.backgroundSize = 'cover';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundPosition = 'center';
  }