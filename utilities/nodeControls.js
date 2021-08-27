const createNode = (type,classStrArr,valStr) => {
  let element = document.createElement(type);
  classStrArr.forEach(classStr => {
    element.classList.add(classStr.replace(/\s/g,''));
  });
  if(valStr)element.textContent = valStr;
  return element;
}

const recursiveNodeDelete = (parentElement) => {
  while(parentElement.hasChildNodes()) {
    clear(parentElement.firstChild)
  }
  function clear(node) {
    while(node.hasChildNodes()) {
      clear(node.firstChild);
    }
    node.parentElement.removeChild(node);
  }
}

function buildTimerNodes(timerName,hours,minutes,seconds,timerCompleted){
  const timerListItem = createNode('li',[`timer-entry`,`--${timerName}`,`${timerCompleted?'--completed':'timer-entry'}`]);
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
  const timerDeleteTask = createNode('button',[`timer-entry__delete-task`,`--${timerName}`],'✘');
  timerListItem.append(timerNameItem,timerInfoWrapper);
  timerInfoWrapper.append(timerTimingWrapper,timerActionsWrapper);
  timerTimingWrapper.append(timerCurrentTime,'/',timerForecastTime);
  timerActionsWrapper.append(timerToggleStart,timerCompleteTask,timerDeleteTask);

  timersContainer.appendChild(timerListItem);

  if (timerCompleted) {
    timerToggleStart.setAttribute('disabled','disabled');
    timerCompleteTask.setAttribute('disabled','disabled');
  }

  return logicNodes = {
    timerCurrentTime,
    timerToggleStart,
    timerCompleteTask,
    timerDeleteTask,
    timerListItem,
    timersContainer
  }
}