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
  const {timerHours:{value:hours},timerMinutes:{value:minutes},timerSeconds:{value:seconds}} = form;
  const newTimer = {
    timerName,
    hours,
    minutes,
    seconds
  };
  validateForm(newTimer);
  if (isFormError) return;
  createTimer(newTimer);
  e.target.reset();
  toggleModal();
}

function buildTimerNodes(timerName,hours,minutes,seconds){
  const timerListItem = createNode('li',[`timer-entry`,`--${timerName}`]);
  const timerNameItem = createNode('h4',[`timer-entry__name`,`--${timerName}`],timerName);
  const timerInfoWrapper = createNode('div',[`timer-entry__info`,`--${timerName}`]);
  const timerTimingWrapper = createNode('div',[`timer-entry__timing`,`--${timerName}`]);
  const timerCurrentTime = createNode('time',[`timer-entry__current-time`,`--${timerName}`],`00:00:00`);
  const [hoursPadded,minutesPadded,secondsPadded] = getPaddedTime(hours,minutes,seconds);
  const timerForecastTime = createNode(
    'time',
    [`timer-entry__forecasted`,`--${timerName}`],
    `${hoursPadded}:${minutesPadded}:${secondsPadded}`
    );
  const timerActionsWrapper = createNode('div',[`timer-entry__actions`,`--${timerName}`]);
  const timerToggleStart = createNode('button',[`timer-entry__toggle-start`,`--${timerName}`],'▷');
  const timerCompleteTask = createNode('button',[`timer-entry__complete-task`,`--${timerName}`],'✔');
  timerListItem.append(timerNameItem,timerInfoWrapper);
  timerInfoWrapper.append(timerTimingWrapper,timerActionsWrapper);
  timerTimingWrapper.append(timerCurrentTime,'/',timerForecastTime);
  timerActionsWrapper.append(timerToggleStart,timerCompleteTask);

  timersContainer.appendChild(timerListItem);
  return logicNodes = {
    timerCurrentTime,
    timerToggleStart,
    timerCompleteTask
  }
}

function createTimer(newTimer,isNewTimer = true,index = 0){
  const {timerName,hours,minutes,seconds} = newTimer; 
  const logicNodes = buildTimerNodes(timerName,hours,minutes,seconds)
  
  if(isNewTimer) {
    let timerSetup = makeTimer(newTimer,logicNodes);
    timerSetup.setUpTimer();
    timerData[timerData.length] = timerSetup;
  } else {
    let newProperties = getTimerMethods(newTimer,logicNodes);
    console.log(newProperties);
    Object.defineProperties(timerData[index],newProperties);
    console.log(timerData[index]);
    timerData[index].timerNodes = logicNodes;
    timerData[index].setUpTimer();
  }
  updateGlobalForecast();
}

function updateGlobalForecast(){
  const globalForecast = timerData.reduce((totalForecast,currentTimer) => {
    return totalForecast + currentTimer.forecastedTimeAsMilliseconds;
  },0)
  globalForecasted = globalForecast;
  const [hoursPadded,minutesPadded,secondsPadded] = getPaddedTime(globalForecast.hours,globalForecast.minutes,globalForecast.seconds);
  console.log(totalForecastedDisplay);
  totalForecastedDisplay.setAttribute('datetime',`PT${hoursPadded}H${minutesPadded}M${secondsPadded}S`);
  totalForecastedDisplay.textContent = `${hoursPadded}:${minutesPadded}:${secondsPadded}`;
  console.log(totalForecastedDisplay);
  console.log(`hoursPadded`, hoursPadded)
  console.log(`minutesPadded`, minutesPadded)
  console.log(`secondsPadded`, secondsPadded)
  console.log(convertMillisecondsToReadable(globalForecast));
}

function loadTimers(timers){
  timers.forEach((timer,i) => {
    createTimer(timer.configuration,false,i);
  })
  updateGlobalForecast();
}

function saveTimers(){
  localStorage.setItem('timerData',JSON.stringify(timerData));
}

loadTimers(timerData);