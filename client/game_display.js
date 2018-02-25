import { getState } from '/imports/state.js';
import { Events } from '/imports/events.js';

Template.answer_board.onCreated(function () {
  console.log("Templated created, registering for events with", Events);

  Events.on("testev", function () {
    console.log("Recieved test event:", arguments);
  });
});

let snd_theme;

Template.logo.onCreated(function () {
  snd_theme = new Audio('/ff-theme-short.mp3');
});

Template.logo.helpers({
  question_set: getState('question_set'),
  play_theme: function () {
    snd_theme.play();
  },
});


