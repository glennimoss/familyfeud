import { Answers, State, getState, set_state, Helpers } from '/imports/state.js';

const _with_suffix = ['1st', '2nd', '3rd'];
Template.controller.helpers({
  answers: Helpers.answers,
  nth: function () {
    return _with_suffix[getState("numStrikes")];
  },
  phaseIn: function () {
    const phase = getState("phase");
    return _.values(arguments).slice(1, -1).indexOf(phase) != -1;
  },
});

var hideStrikes = function () {
  console.log("hideStrikes");
  set_state({showStrikes: false})
  if (getState('numStrikes') == 3) {
    set_state({
      numStrikes: 0,
      phase: 'steal'
    });
    invertControl();
  } else if (getState('phase') == 'steal') {
    invertControl();
    win();
  }
}

var win = function () {
  var team = getState('control');
  State.update(`score_${team}`, {$inc: {value: getState('pending_score')}});
  set_state({
    pending_score: "",
    phase: "reveal",
  });
}

var invertControl = function () {
  set_state({control:(getState('control') == 'team1' ? 'team2' : 'team1')});;
}

Template.controller.events({
  'click .choose-set button': function (event) {
    var set_name = $(event.currentTarget).text()
      , state = {question_set: set_name};

    if (set_name.search('Fast Money') == 0) {
      state.screen = 'fast-money';
    }

    set_state(state);
    Meteor.call('get_all_questions');
  },
  'click #cntl-team1': function () {
    set_state({
      control: 'team1',
      phase: "play",
    });
  },
  'click #cntl-team2': function () {
    set_state({
      control: 'team2',
      phase: "play",
    });
  },
  'click #strike': function () {
    Meteor.call("strike");

    console.log("click strike");
    let numStrikes = getState('numStrikes')
      , showStrikes = getState('showStrikes')
      ;
    console.log("click strike", numStrikes, showStrikes);

    if (!showStrikes) {
      if (getState('phase') == 'play') {
        numStrikes += 1;
      }

      set_state({
        numStrikes: numStrikes,
        showStrikes: true,
      });

      Meteor.setTimeout(hideStrikes, 1500);
    }
  },
  'click td.show-button button': function (event) {
    const $tgt = $(event.currentTarget)
        , idx = $tgt.parents('tr').index()
        ;

    //Answers.update({_id: `a${idx}`}, {$set: {flipside: "side2"}});
    Meteor.call("flip", idx);

    var phase = getState('phase');
    if ((phase == 'play' && _.all(getState('flipped')())) ||
        phase == 'steal') {
      win();
    }
  },
  'click #next-q': function (event) {
    Meteor.call('next_question');
  },
});
