Meteor.subscribe("state");
Meteor.subscribe("answers");

Template.dispatcher.helpers({
  path: function (val) {
    return window.location.pathname == val
  },
});

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

document.addEventListener('touchmove', function (event) {
  event.preventDefault();
});
