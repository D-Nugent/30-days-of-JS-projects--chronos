const createNode = (type,classStrArr,valStr) => {
  let element = document.createElement(type);
  classStrArr.forEach(classStr => {
    element.classList.add(classStr.replace(/\s/g,''));
  });
  if(valStr)element.textContent = valStr;
  return element;
}