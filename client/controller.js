import { Answers, State, getState, set_state, Helpers } from '/imports/state.js';

const _with_suffix = ['1st', '2nd', '3rd'];
Template.answer_list.helpers({
  answers: Helpers.answers,
  nth: function () {
    return _with_suffix[getState("numStrikes")];
  },
});

Template.controller.events({
  'click .choose-set button': function (event) {
    Meteor.call('choose_questionset', $(event.currentTarget).text());
  },
  'click td.show-button button': function (event) {
    const $tgt = $(event.currentTarget)
        , idx = $tgt.parents('tr').index()
        ;
    Meteor.call("doAction", "correctGuess", idx);
  },
  'click #state-actions button[name]': function (evt) {
    Meteor.call('doAction', evt.target.name);
  },
  'click #next-q': function (event) {
    Meteor.call('next_question');
  },
});
