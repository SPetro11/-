// ========== СЛАЙДЕР ==========
// ========== СЛАЙДЕР ==========
(function() {
    const slides = document.querySelectorAll('.wd-slide');
    const dots = document.querySelectorAll('.dot');
    const prev = document.querySelector('.prev-arrow');
    const next = document.querySelector('.next-arrow');
    const timerProgress = document.querySelector('.timer-progress');
    let current = 0;
    let interval;
    const total = slides.length;
    const AUTO_INTERVAL = 10000;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        current = (index + total) % total;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        if (timerProgress) {
            timerProgress.style.animation = 'none';
            void timerProgress.offsetWidth;
            timerProgress.style.animation = `timer ${AUTO_INTERVAL / 1000}s linear forwards`;
        }
    }

    function nextSlide() {
        showSlide(current + 1);
        restartAuto();
    }

    function prevSlide() {
        showSlide(current - 1);
        restartAuto();
    }

    function startAuto() {
        interval = setInterval(nextSlide, AUTO_INTERVAL);
    }

    function stopAuto() {
        clearInterval(interval);
    }

    function restartAuto() {
        stopAuto();
        startAuto();
    }

    if (prev) prev.addEventListener('click', prevSlide);
    if (next) next.addEventListener('click', nextSlide);
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        showSlide(i);
        restartAuto();
    }));

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAuto);
        sliderContainer.addEventListener('mouseleave', startAuto);
    }

    showSlide(0);
    startAuto();
})();

// ========== МОБИЛЬНОЕ МЕНЮ ==========
(function() {
    const toggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('mainNav');
    if (toggle && navMenu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.querySelectorAll('#mainNav a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        document.addEventListener('click', (event) => {
            if (!toggle.contains(event.target) && !navMenu.contains(event.target)) {
                toggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
})();

// ========== РЕАЛЬНАЯ ПОГОДА (Open-Meteo) ==========
async function fetchRealWeather() {
    try {
        const lat = 62.035347;
        const lon = 129.737200;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const response = await fetch(url);
        const data = await response.json();

        const current = data.current_weather;
        const temp = Math.round(current.temperature);
        const wind = current.windspeed;
        const weatherCode = current.weathercode;
        let desc = '', icon = '';
        if (weatherCode === 0) { desc = 'Ясно'; icon = '☀️'; }
        else if (weatherCode === 1 || weatherCode === 2) { desc = 'Малооблачно'; icon = '⛅'; }
        else if (weatherCode === 3) { desc = 'Облачно'; icon = '☁️'; }
        else if (weatherCode >= 51 && weatherCode <= 67) { desc = 'Дождь'; icon = '🌧️'; }
        else if (weatherCode >= 71 && weatherCode <= 77) { desc = 'Снег'; icon = '❄️'; }
        else if (weatherCode >= 80 && weatherCode <= 99) { desc = 'Ливень/гроза'; icon = '⛈️'; }
        else { desc = 'Переменная облачность'; icon = '🌤️'; }

        const feelsLike = Math.round(temp - (wind * 0.2));
        const now = new Date();
        const currentHour = now.getHours();
        const humidity = data.hourly.relativehumidity_2m[currentHour] || '--';

        document.getElementById('currentTemp').innerText = temp;
        document.getElementById('weatherDesc').innerText = desc;
        document.getElementById('windSpeed').innerText = wind + ' м/с';
        document.getElementById('humidity').innerText = humidity + '%';
        document.getElementById('feelsLike').innerText = feelsLike + '°';
        document.getElementById('weatherIcon').innerText = icon;

        const daily = data.daily;
        const forecastContainer = document.getElementById('weatherForecast');
        if (forecastContainer) {
            forecastContainer.innerHTML = '';
            for (let i = 0; i < daily.time.length; i++) {
                const date = new Date(daily.time[i]);
                const dayName = i === 0 ? 'Сегодня' : date.toLocaleDateString('ru-RU', { weekday: 'short' });
                let codeIcon = '';
                const wCode = daily.weathercode[i];
                if (wCode === 0) codeIcon = '☀️';
                else if (wCode === 1 || wCode === 2) codeIcon = '⛅';
                else if (wCode === 3) codeIcon = '☁️';
                else if (wCode >= 51 && wCode <= 67) codeIcon = '🌧️';
                else if (wCode >= 71 && wCode <= 77) codeIcon = '❄️';
                else codeIcon = '🌤️';

                forecastContainer.innerHTML += `
                    <div class="forecast-card">
                        <div class="forecast-day">${dayName}</div>
                        <div class="forecast-icon">${codeIcon}</div>
                        <div class="forecast-temp">
                            <span class="temp-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                            <span class="temp-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Погода не загружена:', error);
        document.getElementById('weatherDesc').innerText = 'Не удалось загрузить';
    }
}

fetchRealWeather();
setInterval(fetchRealWeather, 1800000);

// ========== РЕЖИМ РАБОТЫ ==========
(function() {
    function updateWorkingStatus() {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const mins = now.getMinutes();
        const timeNow = hours * 60 + mins;

        const weekCard = document.getElementById('weekdaysCard');
        const satCard = document.getElementById('saturdayCard');
        const sunCard = document.getElementById('sundayCard');

        [weekCard, satCard, sunCard].forEach(c => c?.classList.remove('current'));

        let status = '';
        if (day >= 1 && day <= 5) {
            if (weekCard) weekCard.classList.add('current');
            const start = 9 * 60;
            const breakStart = 13 * 60;
            const breakEnd = 14 * 60;
            const close = 18 * 60;
            if (timeNow >= start && timeNow < breakStart) {
                status = '🟢 Сейчас открыто (до перерыва 13:00)';
            } else if (timeNow >= breakStart && timeNow < breakEnd) {
                status = '🟡 Сейчас перерыв до 14:00';
            } else if (timeNow >= breakEnd && timeNow < close) {
                status = '🟢 Сейчас открыто (до 18:00)';
            } else {
                status = '🔴 Закрыто, приходите завтра с 9:00';
            }
        } else if (day === 6) {
            if (satCard) satCard.classList.add('current');
            if (timeNow >= 9 * 60 && timeNow < 16 * 60) {
                status = '🟢 Сейчас открыто (суббота до 16:00)';
            } else {
                status = '🔴 Суббота: работаем до 16:00';
            }
        } else {
            if (sunCard) sunCard.classList.add('current');
            status = '🔴 Воскресенье — выходной';
        }

        const statusText = document.getElementById('statusText');
        if (statusText) statusText.innerText = status;

        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl) {
            currentTimeEl.innerText = now.toLocaleTimeString('ru-RU');
        }
    }

    updateWorkingStatus();
    setInterval(updateWorkingStatus, 1000);
})();

// ========== ПЛАВНАЯ ПРОКРУТКА ==========
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
})();

// ========== МОБИЛЬНОЕ МЕНЮ ==========
(function() {
    const toggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('mainNav');
    if (toggle && navMenu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.querySelectorAll('#mainNav a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        document.addEventListener('click', (event) => {
            if (!toggle.contains(event.target) && !navMenu.contains(event.target)) {
                toggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
})();

// ========== ПОГОДА (ДЕМО-ДАННЫЕ) ==========
(function() {
    const weather = {
        temp: -17,
        feels: -21,
        desc: 'Снег с прояснениями',
        wind: 3.2,
        humidity: 79,
        icon: '❄️'
    };
    const forecast = [
        { day: 'Сегодня', high: -12, low: -22, icon: '🌨️' },
        { day: 'Завтра', high: -14, low: -23, icon: '❄️' },
        { day: 'Ср', high: -10, low: -19, icon: '⛅' },
        { day: 'Чт', high: -7, low: -16, icon: '☀️' },
        { day: 'Пт', high: -5, low: -14, icon: '☀️' }
    ];

    function updateWeatherUI() {
        document.getElementById('currentTemp').innerText = weather.temp;
        document.getElementById('weatherDesc').innerText = weather.desc;
        document.getElementById('windSpeed').innerText = weather.wind + ' м/с';
        document.getElementById('humidity').innerText = weather.humidity + '%';
        document.getElementById('feelsLike').innerText = weather.feels + '°';
        document.getElementById('weatherIcon').innerText = weather.icon;

        const container = document.getElementById('weatherForecast');
        if (container) {
            container.innerHTML = forecast.map(f => `
                <div class="forecast-card">
                    <div class="forecast-day">${f.day}</div>
                    <div class="forecast-icon">${f.icon}</div>
                    <div class="forecast-temp">
                        <span class="temp-high">${f.high}°</span>
                        <span class="temp-low">${f.low}°</span>
                    </div>
                </div>
            `).join('');
        }
    }

    updateWeatherUI();
    // Обновление погоды каждые 30 минут (имитация)
    setInterval(() => {
        weather.temp += (Math.random() * 2 - 1).toFixed(1) * 1;
        weather.temp = Math.min(-5, Math.max(-30, weather.temp));
        weather.feels = weather.temp - 4;
        updateWeatherUI();
    }, 1800000);
})();

// ========== РЕЖИМ РАБОТЫ И ОНЛАЙН-СТАТУС ==========
(function() {
    function updateWorkingStatus() {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const mins = now.getMinutes();
        const timeNow = hours * 60 + mins;

        const weekCard = document.getElementById('weekdaysCard');
        const satCard = document.getElementById('saturdayCard');
        const sunCard = document.getElementById('sundayCard');

        [weekCard, satCard, sunCard].forEach(c => c?.classList.remove('current'));

        let status = '';
        if (day >= 1 && day <= 5) {
            if (weekCard) weekCard.classList.add('current');
            const start = 9 * 60;
            const breakStart = 13 * 60;
            const breakEnd = 14 * 60;
            const close = 18 * 60;
            if (timeNow >= start && timeNow < breakStart) {
                status = '🟢 Сейчас открыто (до перерыва 13:00)';
            } else if (timeNow >= breakStart && timeNow < breakEnd) {
                status = '🟡 Сейчас перерыв до 14:00';
            } else if (timeNow >= breakEnd && timeNow < close) {
                status = '🟢 Сейчас открыто (до 18:00)';
            } else {
                status = '🔴 Закрыто, приходите завтра с 9:00';
            }
        } else if (day === 6) {
            if (satCard) satCard.classList.add('current');
            if (timeNow >= 9 * 60 && timeNow < 16 * 60) {
                status = '🟢 Сейчас открыто (суббота до 16:00)';
            } else {
                status = '🔴 Суббота: работаем до 16:00';
            }
        } else {
            if (sunCard) sunCard.classList.add('current');
            status = '🔴 Воскресенье — выходной';
        }

        const statusText = document.getElementById('statusText');
        if (statusText) statusText.innerText = status;

        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl) {
            currentTimeEl.innerText = now.toLocaleTimeString('ru-RU');
        }
    }

    updateWorkingStatus();
    setInterval(updateWorkingStatus, 1000);
})();

// ========== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ ==========
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
})();