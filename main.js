import "./style.css"
import { getWeather } from "./weather"
import { ICON_MAP } from "./iconMap"

const apiKey = import.meta.env.VITE_API_KEY;
const themeToggle = document.getElementById("themeToggle");
const toggleLabel = document.getElementById("toggleLabel");
const bodyClass = document.body.classList;

// Function to toggle the theme
function toggleTheme() {
  if (themeToggle.checked) {
    // Dark mode
    bodyClass.remove("light-mode");
    bodyClass.add("dark-mode");
    toggleLabel.textContent = "Toggle Light Mode"; // Update label text
    localStorage.setItem("theme", "dark");
  } else {
    // Light mode
    bodyClass.remove("dark-mode");
    bodyClass.add("light-mode");
    toggleLabel.textContent = "Toggle Dark Mode"; // Update label text
    localStorage.setItem("theme", "light");
  }
}

// Event listener for the theme toggle
themeToggle.addEventListener("change", toggleTheme);

// Check and set the initial theme based on user preference or local storage
function setInitialTheme() {
  const userPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark" || (userPrefersDark && !storedTheme)) {
    // Set dark mode
    bodyClass.add("dark-mode");
    toggleLabel.textContent = "Toggle Light Mode"; // Update label text
    themeToggle.checked = true; // Toggle the checkbox
  } else {
    // Set light mode
    bodyClass.add("light-mode");
    toggleLabel.textContent = "Toggle Dark Mode"; // Update label text
    themeToggle.checked = false; // Ensure checkbox is unchecked
  }
}

// Call the function to set the initial theme
setInitialTheme();


navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({ coords }) {
  getWeather(
    coords.latitude,
    coords.longitude,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
    .then(renderWeather)
    .catch(e => {
      console.error(e)
      alert("Error getting weather.")
    })

    displayLocation(coords);
}

function positionError() {
  alert(
    "There was an error getting your location. Please allow us to use your location and refresh the page."
  )
}

function displayLocation(coords) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`)
    .then(response => response.json())
    .then(data => {
      const address = data.address;
      const city = address.city || address.town || address.village;
      const state = address.state;
      setValue('location', `${city}, ${state}`);
    })
    .catch(e => {
      console.error(e);
      alert("Error converting latitude and longitude to city and state");
    });
}

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")
function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)



}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")


function renderDailyWeather(daily) {
  dailySection.innerHTML = "";
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true);
    setValue("max-temp", `${day.maxTemp}°`, { parent: element });
    setValue("min-temp", `${day.minTemp}°`, { parent: element });
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element });
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode);
    dailySection.append(element);
  });
}


const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp, { parent: element })
    setValue("fl-temp", hour.feelsLike, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}

