Meteor.subscribe("state");
Meteor.subscribe("answers");

Template.dispatcher.helpers({
  path: function (val) {
    return window.location.pathname == val
  },
});

global.randomChars = function globalfunc (len=10) {
  let chars = [];
  for (let i=0; i<len; i++) {
    let char = Math.floor(Math.random()*(102 - 65)) + 65;
    if (char == 101) char = 32;
    else if (char > 90) char -= 43;
    chars.push(String.fromCharCode(char));
  }

  return chars.join('');
}

global.sampleStrings = function sampleStrings (len=10, numSamples=1000) {
  const tb = document.getElementById("testbed");

  const samples = [];

  for (let i=0; i<numSamples; i++) {
    tb.innerText = randomChars(len);
    samples.push(tb.scrollWidth);
  }

  return samples.reduce((a,b) => a+b)/samples.length;
}

global.resizeText = function resizeText (elem) {
  console.log(elem.scrollWidth, elem.clientWidth)
  const origWidth = elem.clientWidth;
  if (origWidth == elem.scrollWidth) return;
  let fontSize = 13, highWater = 26, lowWater = 0;

  console.log(elem.scrollWidth / origWidth, "times too big");

  elem.style.width = "0px";
  let i=0;

  while (i < 100 && (Math.abs(origWidth - elem.scrollWidth) > 2 || elem.scrollWidth > origWidth)) {
    i++;
    console.log("Trying fontSize", fontSize);
    elem.style.fontSize = `${fontSize}px`;
    if (origWidth > elem.scrollWidth) {
      console.log("Too small");
      lowWater = fontSize;
    } else {
      console.log("Too big");
      highWater = fontSize;
    }
    fontSize = (highWater + lowWater)/2;
    console.log('(', highWater, '+', lowWater, ')/2 =', fontSize, "Difference", origWidth - elem.scrollWidth );
  }

  elem.style.width = null;
}

global.scaleText = function scaleText (elem) {
  elem.style.transform = null;
  console.log(elem.scrollWidth, elem.clientWidth)
  if (elem.scrollWidth > elem.clientWidth) {
    console.log("  scaling");
    const ratio = elem.clientWidth / elem.scrollWidth
        , offset = Math.round((elem.scrollWidth - elem.clientWidth)/2)
        ;
    elem.style.transform = `scaleX(${ratio}) translateX(-${offset}px)`;
  }
}
