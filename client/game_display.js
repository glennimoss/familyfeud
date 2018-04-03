import { Events } from '/imports/events.js';
import snd from '/imports/audio.js';

Template.game_display.events({
  'click #reset button': function () {
    Meteor.call('reset');
  },
});

Template.answer_board.onCreated(function () {
  console.log("Templated created, registering for events with", Events);

  Events.on("testev", function () {
    console.log("Recieved test event:", arguments);
  });
});

Template.logo.helpers({
  play_theme: function () {
    snd.theme.play();
  },
});


