Template.controller.all_question_sets = getState('all_question_sets');
Template.controller.question_set = getState('question_set');

Template.controller.score_team1 = getState('score_team1');
Template.controller.score_team2 = getState('score_team2');

Template.controller.screen = ifState('screen');
Template.controller.control = ifState('control');
Template.controller.phase = ifState("phase");
Template.controller.phaseIn = getState("phase", function (phase) {
  return _.values(arguments).slice(1, -1).indexOf(phase) != -1;
});
Template.controller.question = getState('question');


Template.stat_summary.phase = ifState("phase");
Template.stat_summary.control = ifState('control');
Template.stat_summary.score_team1 = getState('score_team1');
Template.stat_summary.score_team2 = getState('score_team2');

Template.host.question = getState('question');

var hideStrikes = function () {
  set_state({showStrikes: false})
  if (getState('numStrikes')() == 3) {
    set_state({
      numStrikes: 0,
      phase: 'steal'
    });
    invertControl();
  } else if (getState('phase')() == 'steal') {
    invertControl();
    win();
  }
}

var win = function () {
  var team = getState('control')();
  State.update('score_' + team, {$inc: {value: getState('pending_score')()}});
  set_state({
    pending_score: "",
    phase: "reveal",
  });
}

var invertControl = function () {
  var cntl = State.findOne('control').value;
  set_state({control:(cntl == 'team1' ? 'team2' : 'team1')});;
}

Template.controller.events({
  'click .choose-set button': function (event) {
    var set_name = $(event.currentTarget).text()
      , state = {question_set: set_name};

    if (set_name.search('Fast Money') == 0) {
      state.screen = 'fast_money';
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
    var numStrikes = State.findOne('numStrikes').value
      , showStrikes = State.findOne('showStrikes').value;

    if (!showStrikes) {
      if (State.findOne('phase').value == 'play') {
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
    var $tgt = $(event.currentTarget)
      , idx = $tgt.parents('tr').index()
      , flipped = {};

    flipped['value.' + idx] = true;
    State.update('flipped', {$set: flipped});

    var phase = getState('phase')();
    if (phase != 'reveal') {
      var question = Template.controller.question();
      State.update('pending_score', {$inc:
        {value: question.answers[idx].score * question.factor}});
    }

    if ((phase == 'play' && _.all(getState('flipped')())) ||
        phase == 'steal') {
      win();
    }
  },
  'click #next-q': function (event) {
    Meteor.call('next_question');
  },
});

Template.controller.flipped = getState('flipped', function (flipped) {
  return flipped[this._index];
});

var _with_suffix = ['1st', '2nd', '3rd'];
Template.controller.nth = getState('numStrikes', function (num) {
  return _with_suffix[num];
});
