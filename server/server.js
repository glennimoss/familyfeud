var freshBoard = {
  phase: "faceoff",
  showStrikes: false,
  numStrikes: 0,
  flipped: [],
  question: {
    question: "",
    factor: 1,
    answers: [],
  },
  pending_score: 0,
  control: null,
  fm_total_score: 0,
};

var freshState = _.extend({}, freshBoard, {
  screen: "logo",
  score_team1: 0,
  score_team2: 0,
  question_set: "",
  q_num: 0,
  phase: "pregame",
  all_question_sets: _.keys(questionsets),
  all_questions: [],
  fm_answer: null,
});

var reset = function () {
  State.remove({})

  for (var key in freshState) {
    State.insert({
      _id: key,
      value: freshState[key],
    });
  }
}

Meteor.methods({
  question_sets: function () {
    return _.keys(questionsets);
  },
  next_question: function () {
    var q_num = State.findOne('q_num').value
      , question_set = State.findOne('question_set').value
      , questions = questionsets[question_set] || []

    if (q_num < questions.length) {
      var state = _.extend({}, freshBoard, {
        screen: "board",
        question: questions[q_num],
        flipped: _.times(questions[q_num].answers.length, function () {}),
      });
      set_state(state);
      State.update('q_num', {$inc: {value: 1}});
    } else {
      reset();
    }
  },
  get_all_questions: function () {
    set_state({all_questions: questionsets[State.findOne('question_set').value]});
  },
  reset: reset,
});

Meteor.startup(function () {
  reset();

  Meteor.publish("state", function () {
    return State.find();
  });


  /* To randomize questions into manageable sets...

  var rand = _.shuffle(questionsets['Random'])
    , new_questionset = {};

  for (var i = 0; i < 60; i += 10) {
    var thisset = rand.slice(i, i + 5);
    thisset[2].factor = 2;
    thisset[3].factor = 2;
    thisset[4].factor = 3;
    new_questionset["Random " + ((i/10) + 1)] = thisset;
    new_questionset["Fast Money Random " + ((i/10) + 1)] = rand.slice(i + 5, i + 10);
  }

  console.log(JSON.stringify(new_questionset));
  */
});
