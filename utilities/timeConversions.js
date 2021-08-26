const convertTimetoMilliseconds = (hours = 0, minutes = 0, seconds = 0) => {
  const hoursToMilliseconds = (hours * 60) * 60000;
  const minutesToMilliseconds = minutes * 60000;
  const secondsToMilliseconds = seconds * 1000;
  return hoursToMilliseconds + minutesToMilliseconds + secondsToMilliseconds;
};

const convertMillisecondsToReadable = (milliseconds) => {
  const totalTime = milliseconds;
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
}

const getPaddedTime = (hours = 0,minutes = 0,seconds = 0) => {
  const applyPadding = (timeValue) => timeValue.toString().length < 2 && timeValue<10?`0${timeValue}`:timeValue;
  return [
    applyPadding(hours),
    applyPadding(minutes),
    applyPadding(seconds),
  ]
}