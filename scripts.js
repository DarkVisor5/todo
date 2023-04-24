const inputField = document.getElementById('my-input');
const addButton = document.getElementById('Message_written');
const todoList = document.querySelector('.code-da-fare ul');
const timeInput = document.getElementById('time-input');

// Inizializza Flatpickr per l'input dell'orario
flatpickr(timeInput, {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
});

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Notifiche abilitate');
  } else {
    console.log('Notifiche non abilitate');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  requestNotificationPermission();
});


function showNotification(message) {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    const notification = new Notification('Notifica Appuntamento', {
      body: message,
    });

    // Chiudi la notifica dopo 5 secondi
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
}


function generateCalendar() {
  const calendarBody = document.getElementById('calendar-body');
  const startHour = 8;
  const endHour = 21;

  for (let hour = startHour; hour <= endHour; hour++) {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.textContent = `${hour}:00`;
    row.appendChild(timeCell);

    for (let day = 1; day <= 7; day++) {
      const dayCell = document.createElement('td');
      const ul = document.createElement('ul');
      ul.style.listStyleType = 'none';
      ul.style.padding = '0';
      ul.style.margin = '0';
      dayCell.appendChild(ul);
      row.appendChild(dayCell);
    }

    calendarBody.appendChild(row);
  }
}


generateCalendar();

function saveTodoList() {
  const todos = [];
  const todoItems = todoList.querySelectorAll('li');
  todoItems.forEach((item) => {
    todos.push(item.textContent);
  });

  localStorage.setItem('todoList', JSON.stringify(todos));
}

function loadTodoList() {
  const storedTodos = localStorage.getItem('todoList');
  if (storedTodos) {
    const todos = JSON.parse(storedTodos);
    todos.forEach((todo) => {
      const listItem = document.createElement('li');
      listItem.textContent = todo;

      listItem.addEventListener('click', () => {
        listItem.remove();
        saveTodoList();
      });

      todoList.appendChild(listItem);
    });
  }
}

function addTodoItem() {
  const inputValue = inputField.value.trim();
  const inputTime = document.getElementById('time-input').value;
  const inputDay = document.getElementById('day-input').value;

  if (inputValue === '') {
    return;
  }

  if (inputTime && inputDay) {
    const [hours, minutes] = inputTime.split(':');
    const hourIndex = parseInt(hours) - 8;
    const dayCell = document.querySelector(`#calendar-body tr:nth-child(${hourIndex + 1}) td:nth-child(${parseInt(inputDay) + 1})`);

    if (dayCell) {
      dayCell.textContent = `${inputValue} (${inputTime})`;
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = inputValue;

      listItem.addEventListener('click', () => {
        listItem.remove();
        saveTodoList();
      });

      todoList.appendChild(listItem);
    }

    // Pianifica la notifica
    const appointmentDate = new Date();
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const now = new Date();

    if (appointmentDate > now) {
      const timeout = appointmentDate.getTime() - now.getTime();
      setTimeout(() => {
        showNotification(`Appuntamento: ${inputValue} alle ${inputTime}`);
      }, timeout);
    }
  } else {
    const listItem = document.createElement('li');
    listItem.textContent = inputValue;

    listItem.addEventListener('click', () => {
      listItem.remove();
      saveTodoList();
    });

    todoList.appendChild(listItem);
  }

  inputField.value = '';

  saveTodoList();
}


addButton.addEventListener('click', (event) => {
  event.preventDefault();
  addTodoItem();
});

inputField.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addTodoItem();
  }
});

loadTodoList();
