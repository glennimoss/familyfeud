import { getState, set_state } from '/imports/state.js';
let tmout = {};

function resetBg (e) {
  if (tmout[e.id]) {
    clearTimeout(tmout);
  }

  tmout[e.id] = setTimeout(() => {
    e.style.backgroundColor = null;
    tmout[e.id] = null;
  }, 1000);
}

function changeBg (color) {
  return function (event) {
    console.log(event.type, event);
    event.target.style.backgroundColor = color;
    resetBg(event.target);
  };
}


Template.buzzer.events({
  'touchstart .buzzer': function (evt) {
    const control = getState('control');

    if (!control) {
      set_state({control: evt.target.id});

      Meteor.call('doAction', 'buzz', evt.target.id);
    }
  },
});
