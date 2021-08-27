// Element Selectors
const addtimer = document.querySelector('.add-entry');
const modalWindow = document.querySelector('.modal');
const cancelNewTimer = modalWindow.querySelector('.new-timer__cancel');
const newTimerForm = modalWindow.querySelector('form');
const formErrorMsg = modalWindow.querySelector('.new-timer__error');
const formErrorMsgDetails = modalWindow.querySelector('.new-timer__error-messages');
const timersContainer = document.querySelector('.timers__container');
const timerStartBtns = document.querySelectorAll('.timer-entry__toggle-start');
const timerCompleteBtns = document.querySelectorAll('.timer-entry__complete-task');
const totalForecastedDisplay = document.querySelector('.statistics__value.--time-forecasted');
const totalTimeWorkedDisplay = document.querySelector('.statistics__value.--time-spent');
const taskStatistics = {
  completed: document.querySelector('.tasks-item__value.--completed'),
  inProgress: document.querySelector('.tasks-item__value.--in-progress'),
  outstanding: document.querySelector('.tasks-item__value.--outstanding'),
}

// Event Listeners
addtimer.addEventListener('click', toggleModal);
cancelNewTimer.addEventListener('click',toggleModal);
newTimerForm.addEventListener('submit',addNewTimer);
window.addEventListener('beforeunload',saveTimers)

// Control Variables
let isModalOpen = false;
let isFormError = false;
let errorMessages = [];
let timerData = JSON.parse(localStorage.getItem('timerData')) || [];
let globalTimeWorked = 0;
let globalForecasted = 0;

// Functions

function toggleModal(){
  isModalOpen? modalWindow.classList.remove('--active'):modalWindow.classList.add('--active');
  isModalOpen = !isModalOpen;
}

function validateForm({timerName,hours,minutes,seconds}){
  // Will check if timerName already exists
  const timerValues = [parseInt(hours),parseInt(minutes),parseInt(seconds)];
  const areTimesNumbers = timerValues.every(val => !isNaN(val));
  if (!areTimesNumbers) {
    isFormError = true;
    errorMessages.push('Non-number entered as time')
  }
  if (isFormError) {
    formErrorMsg.classList.add('--active');
    formErrorMsgDetails.innerHTML = errorMessages.map(msg => {
      return `
        <li class='new-timer__error --active'>${msg}</li>
      `
    })
  }
}

function addNewTimer(e){
  e.preventDefault();
  const form = e.target;
  const timerName = form.timerName.value;
  let {timerHours:{value:hours},timerMinutes:{value:minutes},timerSeconds:{value:seconds}} = form;
  hours = hours === ''?0:hours;
  minutes = minutes === ''?0:minutes;
  seconds = seconds === ''?0:seconds;
  const newTimer = {
    timerName,
    hours,
    minutes,
    seconds,
    timerCompleted: false,
  };
  validateForm(newTimer);
  if (isFormError) return;
  createTimer(newTimer);
  e.target.reset();
  toggleModal();
}

function createTimer(newTimer,isNewTimer = true,index = 0){
  const {timerName,hours,minutes,seconds,timerCompleted} = newTimer; 
  const logicNodes = buildTimerNodes(timerName,hours,minutes,seconds,timerCompleted)
  
  if(isNewTimer) {
    let timerSetup = makeTimer(newTimer,logicNodes);
    timerSetup.setUpTimer();
    timerData[timerData.length] = timerSetup;
  } else {
    let newProperties = getTimerMethods(newTimer,logicNodes);
    Object.defineProperties(timerData[index],newProperties);
    timerData[index].timerNodes = logicNodes;
    timerData[index].setUpTimer();
  }
  updateGlobalForecast();
  updateTaskStatistics();
}

function sumTimerValues(sumParameter){
  return timerData.reduce((totalValue,currentTimer) => {
    let adjustDuration = sumParameter === 'duration' && currentTimer._timerPaused ? '_timerPreviousTime':sumParameter;
    return totalValue + currentTimer[adjustDuration];
  },0)
}

function updateGlobalForecast(){
  const globalForecast = sumTimerValues('forecastedTimeAsMilliseconds');
  globalForecasted = globalForecast;
  const {hours,minutes,seconds} = convertMillisecondsToReadable(globalForecast)
  const [hoursPadded,minutesPadded,secondsPadded] = getPaddedTime(hours,minutes,seconds);
  totalForecastedDisplay.setAttribute('datetime',`PT${hoursPadded}H${minutesPadded}M${secondsPadded}S`);
  totalForecastedDisplay.textContent = `${hoursPadded}:${minutesPadded}:${secondsPadded}`;
}

function updateGlobalTimeWorked(){
  const globalWorked = sumTimerValues('duration');
  globalTimeWorked = globalWorked;
  if (globalTimeWorked>globalForecasted) {
    totalTimeWorkedDisplay.style.color = '#ff5666';
  };
  const {hours,minutes,seconds} = convertMillisecondsToReadable(globalWorked)
  const [hoursPadded,minutesPadded,secondsPadded] = getPaddedTime(hours,minutes,seconds);
  totalTimeWorkedDisplay.setAttribute('datetime',`PT${hoursPadded}H${minutesPadded}M${secondsPadded}S`);
  totalTimeWorkedDisplay.textContent = `${hoursPadded}:${minutesPadded}:${secondsPadded}`;
}

function updateTaskStatistics(){
  const defaultStats = {
    completed: 0,
    inProgress: 0,
    outstanding: 0,
  }
  const statistics = timerData.reduce((statCount,currentTimer) => {
    let status = 'outstanding';
    if (currentTimer._timerCompleted) {
      status = 'completed';
    } else if (currentTimer._timerStarted) {
      status ='inProgress';
    }
    statCount[status] += 1;
    return statCount;
  },defaultStats)
  Object.entries(statistics).forEach(status => {
    taskStatistics[status[0]].textContent = status[1]
  })
}

function loadTimers(timers){
  updateGlobalForecast();
  timers.forEach((timer,i) => {
    createTimer(timer.configuration,false,i);
  });
  if (timers.length == 0) updateTaskStatistics();
}

function saveTimers(){
  localStorage.setItem('timerData',JSON.stringify(timerData));
}

loadTimers(timerData);