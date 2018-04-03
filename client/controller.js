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
  },
  'click td.show-button button': function (event) {
    const $tgt = $(event.currentTarget)
        , idx = $tgt.parents('tr').index()
        ;

    Meteor.call("flip", idx);
  },
  'click #next-q': function (event) {
    Meteor.call('next_question');
  },
});
