import snd from '/imports/audio.js';

Template.game_display.events({
  'click #reset button': function () {
    Meteor.call('reset');
  },
});

Template.logo.helpers({
  play_theme: function () {
    snd.theme.play();
  },
});


