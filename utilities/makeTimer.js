const makeTimer = ({timerName,hours,minutes,seconds},logicNodes) => {
  return({
    _timerName: timerName,
    _forecastedTime: {
      hours,
      minutes,
      seconds
    },
    _timerStarted: false,
    _timerPaused: false,
    _timerStartTime: 0,
    _timerCurrentTime: 0,
    _timerExceedsForecasted: false,
    _timerPreviousTime: 0,
    _timerCompleted:false,
    _timerNodes: logicNodes,
    get forecastedTime(){
      return this._forecastedTime;
    },
     get forecastedTimeAsMilliseconds(){
      const {hours,minutes,seconds} = this.forecastedTime;
      const hoursToMilliseconds = (hours * 60) * 60000;
      const minutesToMilliseconds = minutes * 60000;
      const secondsToMilliseconds = seconds * 1000;
      return hoursToMilliseconds + minutesToMilliseconds + secondsToMilliseconds;
    },
    get duration(){
      return (this._timerCurrentTime - this._timerStartTime) + this._timerPreviousTime;
    },
    get durationAsReadable(){
      const totalTime = this.duration;
      const hours = parseInt((totalTime/60)/60000);
      const hoursToMilliseconds = (hours * 60) * 60000;
      const minutes = parseInt((totalTime-hoursToMilliseconds)/60000);
      const minutesToMilliseconds = minutes * 60000;
      const seconds = parseInt((totalTime-hoursToMilliseconds-minutesToMilliseconds)/1000);
      return {
        hours,
        minutes,
        seconds,
      }
    },
    get configuration(){
      return {
        timerName: this._timerName,
        hours: this._forecastedTime.hours,
        minutes: this._forecastedTime.minutes,
        seconds: this._forecastedTime.seconds,
        timerCompleted: this._timerCompleted
      }
    },
    set timerNodes(nodes){
      this._timerNodes = nodes;
    },
    setUpTimer(){
      this._timerStartTime = 0;
      this._timerCurrentTime = 0;
      this.updateInterface();
      const {timerToggleStart, timerCompleteTask, timerDeleteTask} = this._timerNodes;
      const toggleTimer = this.toggleTimer;
      const completeTimerTask = this.completeTimerTask;
      const deleteTimerTask = this.deleteTimerTask;
      timerToggleStart.addEventListener('click',toggleTimer.bind(this));
      timerToggleStart.addEventListener('transitionend',function(){this.classList.remove('--active')})
      timerCompleteTask.addEventListener('click',completeTimerTask.bind(this));
      timerCompleteTask.addEventListener('transitionend',function(){this.classList.remove('--active')})
      timerDeleteTask.addEventListener('click',deleteTimerTask.bind(this));
    },
    initializeTimer(){
      this._timerStartTime = Date.now();
      this._timerStarted = true;
      this._timerPaused = false;
      updateTaskStatistics();
    },
    toggleTimer(){
      if (this._timerPaused || !this._timerStartTime) {
        this.startTimer();
        this._timerNodes.timerToggleStart.innerHTML = '&#9707;'
      } else {
        this.stopTimer()
        this._timerNodes.timerToggleStart.textContent = '▷'
      }
      this._timerNodes.timerToggleStart.classList.add('--active');
      localStorage.setItem('timerData',JSON.stringify(timerData));
      console.log(timerData);
    },
    startTimer(){
      this.initializeTimer();
      // Declares default starting interval at one second
      let interval = 1000;
      // States what it expects the new time to be
      let expected = this._timerStartTime + interval;
      // Starts the timer after one second
      setTimeout(incrementTimer, interval);
      const context = this;
      function incrementTimer() {
        if (context._timerPaused) return        
        // Checks what the difference is between the time and the time expected (i.e. 20 milliseconds, 100, etc)
        let drift = Date.now() - expected;
        // checks if the drift has exceeded one second and if so resets timer
        if (drift > interval) {
          context._timerStartTime += (drift-interval)
        };
        context._timerCurrentTime = Date.now();
        if (context.duration > context.forecastedTimeAsMilliseconds) {
          context._timerExceedsForecasted = true;
        };
        context.updateInterface();
        // Increments the initial timer by the next expected value
        expected += interval;
        // Recursively calls increment timer
        // If drift has exceeded one second (i.e. negative value) it calls the function immediately
        setTimeout(incrementTimer,Math.max(0, interval - drift));
      }
    },
    stopTimer(){
      this._timerPaused = true;
      this._timerPreviousTime = this.duration;
    },
    updateInterface(){
      const {hours,minutes,seconds} = this.durationAsReadable;
      const {timerCurrentTime} = this._timerNodes;
      const [hoursPadded,minutesPadded,secondsPadded] = getPaddedTime(hours,minutes,seconds);
      timerCurrentTime.setAttribute('datetime',`PT${hoursPadded}H${minutesPadded}M${secondsPadded}S`);
      timerCurrentTime.textContent = `${hoursPadded}:${minutesPadded}:${secondsPadded}`;
      if (this._timerExceedsForecasted) timerCurrentTime.style.color = '#ff5666';
      updateGlobalTimeWorked();
    },
    deleteTimerTask(){
      const timerIndex = timerData.findIndex(timer => timer.configuration.timerName === this._timerName);
      timerData.splice(timerIndex,1);
      recursiveNodeDelete(timersContainer);
      loadTimers(timerData);
      console.log('task deleted');
    },
    completeTimerTask(){
      this._timerCompleted = true;
      updateTaskStatistics();
      const {timerListItem,timerToggleStart,timerCompleteTask} = this._timerNodes;
      timerListItem.classList.add('--completed');
      timerToggleStart.setAttribute('disabled','disabled');
      timerCompleteTask.setAttribute('disabled','disabled');
      console.log('marked as complete');
    },
  })
}

const getTimerMethods = (newTimer,logicNodes) => {
  const tempObj = makeTimer(newTimer,logicNodes);
  const tempProperties = Object.getOwnPropertyDescriptors(tempObj);
  const {
    completeTimerTask,
    configuration,
    deleteTimerTask,
    duration,
    durationAsReadable,
    forecastedTime,
    forecastedTimeAsMilliseconds,
    initializeTimer,
    setUpTimer,
    startTimer,
    stopTimer,
    timerNodes,
    toggleTimer,
    updateInterface
  } = tempProperties;
  const destructuredProperties = {
    completeTimerTask,
    configuration,
    deleteTimerTask,
    duration,
    durationAsReadable,
    forecastedTime,
    forecastedTimeAsMilliseconds,
    initializeTimer,
    setUpTimer,
    startTimer,
    stopTimer,
    timerNodes,
    toggleTimer,
    updateInterface
  }
  return destructuredProperties;
}