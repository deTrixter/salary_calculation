let rateInput = document.getElementById('rate');
let bonusInput = document.getElementById('bonus');
let extraBonusInput = document.getElementById('extraBonus');
let penaltiesInput = document.getElementById('penalties');

let hourlyRateSpan = document.getElementById('hourly-rate');
let overtimeRateSpan = document.getElementById('overtime-rate');
let totalSalarySpan = document.getElementById('total-salary');

let calendarDiv = document.getElementById('calendar');
let monthNameSpan = document.getElementById('month-name');
let resetButton = document.getElementById('reset-button');

let currentMonth = new Date().getMonth(); // Текущий месяц
let currentYear = new Date().getFullYear(); // Текущий год

// Месяцы для отображения
const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Функция для сохранения данных в localStorage
function saveData() {
    const data = {
        rate: rateInput.value,
        bonus: bonusInput.value,
        extraBonus: extraBonusInput.value,
        penalties: penaltiesInput.value,
        days: []
    };

    let days = calendarDiv.getElementsByClassName('day');
    for (let day of days) {
        let dayData = {
            workedHours: day.querySelector('.worked-hours').value,
            coefficient: day.querySelector('.coefficient').value
        };
        data.days.push(dayData);
    }

    localStorage.setItem(`monthData-${currentMonth}-${currentYear}`, JSON.stringify(data));
}

// Функция для загрузки данных из localStorage
function loadData() {
    const data = JSON.parse(localStorage.getItem(`monthData-${currentMonth}-${currentYear}`));

    if (data) {
        rateInput.value = data.rate || '';
        bonusInput.value = data.bonus || '';
        extraBonusInput.value = data.extraBonus || '';
        penaltiesInput.value = data.penalties || '';

        let days = calendarDiv.getElementsByClassName('day');
        for (let i = 0; i < days.length; i++) {
            let dayData = data.days[i] || {};
            days[i].querySelector('.worked-hours').value = dayData.workedHours || '';
            days[i].querySelector('.coefficient').value = dayData.coefficient || 1;
        }
    }
}

// Функция для расчёта зарплаты
function calculateSalary() {
    let rate = parseFloat(rateInput.value) || 0;
    let bonus = parseFloat(bonusInput.value) || 0;
    let extraBonus = parseFloat(extraBonusInput.value) || 0;
    let penalties = parseFloat(penaltiesInput.value) || 0;

    let hourlyRate = rate / 176;
    let overtimeRate = hourlyRate * 0.9;

    // Обновление информации
    hourlyRateSpan.textContent = hourlyRate.toFixed(2);
    overtimeRateSpan.textContent = overtimeRate.toFixed(2);

    let totalWorkedHours = 0;
    let totalSalary = 0;

    // Считываем данные с календаря и считаем отработанные часы
    let days = calendarDiv.getElementsByClassName('day');
    for (let day of days) {
        let workedHours = parseFloat(day.querySelector('.worked-hours').value) || 0;
        let coefficient = parseFloat(day.querySelector('.coefficient').value) || 1;

        totalWorkedHours += workedHours;

        if (workedHours > 176) {
            let overtimeHours = workedHours - 176;
            totalSalary += (176 * hourlyRate); // Первые 176 часов по стандартной ставке
            totalSalary += overtimeHours * overtimeRate * coefficient; // Переработка с коэффициентом
        } else {
            totalSalary += workedHours * hourlyRate * coefficient; // Часы по стандартной ставке с коэффициентом
        }
    }

    // Добавляем премии и вычитаем штрафы
    totalSalary += bonus + extraBonus - penalties;

    // Обновляем итоговую сумму
    totalSalarySpan.textContent = totalSalary.toFixed(2) + ' грн';
}

// Функция для отображения всех дней и их отработанных часов или "Выходной"
function displayWorkHoursList() {
    let hoursList = document.getElementById('hours-list');
    hoursList.innerHTML = ''; // Очищаем список перед обновлением

    let days = calendarDiv.getElementsByClassName('day');
    for (let i = 0; i < days.length; i++) {
        let day = days[i];
        let dayNumber = i + 1;
        let workedHours = day.querySelector('.worked-hours').value;
        
        let listItem = document.createElement('li');
        if (workedHours) {
            listItem.textContent = `День ${dayNumber}: ${workedHours} часов`;
        } else {
            listItem.textContent = `День ${dayNumber}: Выходной`;
        }
        
        hoursList.appendChild(listItem);
    }
}

// Генерация календаря с возможностью выбора месяца
function generateCalendar() {
    // Получаем первый день месяца
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let daysInMonth = lastDayOfMonth.getDate();
    let firstDayOfWeek = firstDayOfMonth.getDay();  // День недели для 1 числа месяца

    // Отображение имени месяца
    monthNameSpan.textContent = months[currentMonth];

    // Очищаем календарь
    calendarDiv.innerHTML = '';

    // Отображаем дни недели
    const weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    weekdays.forEach(day => {
        let headerDiv = document.createElement('div');
        headerDiv.classList.add('day-header');
        headerDiv.textContent = day;
        calendarDiv.appendChild(headerDiv);
    });

    // Исправляем, чтобы месяц начинался с правильного дня недели
    if (firstDayOfWeek === 0) {
        firstDayOfWeek = 7; // Для удобства считаем, что воскресенье — это 7-й день
    }

    // Создаем календарь
    for (let i = 1; i < firstDayOfWeek; i++) {
        let emptyDiv = document.createElement('div');
        calendarDiv.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        let dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        let dayOfWeek = (firstDayOfWeek + i - 1) % 7;

        // Применяем правильные классы для дня недели
        dayDiv.innerHTML = `
            <strong>${i} (${weekdays[dayOfWeek]})</strong>
            <input class="worked-hours" type="number" placeholder="Часы" oninput="calculateSalary(); displayWorkHoursList()">
            <input class="coefficient" type="number" value="1" placeholder="Коэфф." oninput="calculateSalary(); displayWorkHoursList()">
        `;
        
        calendarDiv.appendChild(dayDiv);
    }

    loadData(); // Загружаем сохраненные данные

    // Отображаем список всех часов
    displayWorkHoursList(); // Добавляем список после генерации календаря
}

// Функция для смены месяца
function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    generateCalendar();
    calculateSalary();
}

// Сброс данных
function resetData() {
    if (confirm("Вы уверены, что хотите сбросить все данные за этот месяц?")) {
        localStorage.removeItem(`monthData-${currentMonth}-${currentYear}`);
        generateCalendar();
        calculateSalary();
    }
}

// Инициализация
generateCalendar();
calculateSalary();

// Привязка кнопки сброса
resetButton.addEventListener('click', resetData);

// Сохраняем данные при каждом изменении
rateInput.addEventListener('input', saveData);
bonusInput.addEventListener('input', saveData);
extraBonusInput.addEventListener('input', saveData);
penaltiesInput.addEventListener('input', saveData);
calendarDiv.addEventListener('input', saveData);
