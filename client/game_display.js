import { Events } from '/imports/events.js';
import snd from '/imports/audio.js';

Template.game_display.onCreated(function () {
  Events.on("play-theme", function () {
    snd.theme.play();
  });
});


Template.game_display.events({
  'click #reset button': function () {
    Meteor.call('reset');
  },
});
