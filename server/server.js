import { Answers, State, getState, set_state } from '/imports/state.js';
import { questionsets } from '/imports/canadian_questions.js';
import { Events } from '/imports/events.js';
import _get from 'lodash.get';

var freshBoard = {
  phase: "faceoff",
  showStrikes: false,
  numStrikes: 0,
  //flipped: [],
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
  Answers.remove({});

  for (var key in freshState) {
    State.insert({
      _id: key,
      value: freshState[key],
    });
  }

  for (let i=0; i<10; i++) {
    Answers.insert({
      _id: `a${i}`,
      ord: i + 1,
      answer: "",
      flipside: "side3",
      score: 0,
    });
  }
}

Meteor.methods({
  question_sets: function () {
    return _.keys(questionsets);
  },
  next_question: function () {
    console.log("next_question called.");
    Events.emit("testev", "this is a next_question event?");
    console.log("Event emitted??");
    var q_num = State.findOne('q_num').value
      , question_set = State.findOne('question_set').value
      , questions = questionsets[question_set] || []

    if (q_num < questions.length) {
      var state = _.extend({}, freshBoard, {
        screen: "board",
        question: questions[q_num],
        //flipped: _.times(questions[q_num].answers.length, function () {}),
      });
      set_state(state);
      State.update('q_num', {$inc: {value: 1}});

      for (let idx=0; idx<10; idx++) {
        Answers.update({ _id: "a" + idx },
                       {$set: {
                         //answer: ans.answer,
                         flipside: idx<state.question.answers.length ? "side1" : "side3",
                         //score: ans.score,
                       }});
      }

      Meteor.setTimeout(() => {
        for (let idx=0; idx<10; idx++) {
          const ans = state.question.answers[idx];
          Answers.update({ _id: "a" + idx },
                         {$set: {
                           answer: _get(ans, "answer", ""),
                           score: _get(ans, "score", 0),
                         }});
        }
      }, 500);
    } else {
      reset();
    }
  },
  strike: function () {
    console.log("Strike!");
  },
  get_all_questions: function () {
    set_state({all_questions: questionsets[State.findOne('question_set').value]});
  },
  reset: reset,
  flip: function (idx) {
    const ans = Answers.findOne({_id: `a${idx}`});

    if (ans.flipside == "side1") {
      Answers.update({_id: `a${idx}`}, {$set: {flipside: "side2"}});
      State.update("pending_score", {$inc: { value: ans.score * getState("question").factor}});
    }

    /*
    let newside = "side2";
    if (ans.flipside == "side2") {
      newside = "side3";
    } else if (ans.flipside == "side3") {
      newside = "side1";
    }
    Answers.update({_id: `a${idx}`}, {$set: {flipside: newside}});
    */
  },
});

function* question2yaml (q) {
  yield `${q.question}:`;
  yield `  factor: ${q.factor}`;
  yield `  answers:`;
  for (let a of q.answers) {
    yield `    ${a.answer}: ${a.score}`;
  }
}

Meteor.startup(function () {
  Events.allowRead('all');
  Events.allowWrite('all');

  /*
  for (let setname in questionsets) {
    console.log(`${setname}:`)
    for (let i=0; i<questionsets[setname].length; i++) {
      for (let line of question2yaml(questionsets[setname][i])) {
        console.log(`  ${line}`);
      }
    }
  }
  */

  reset();

  Meteor.publish("state", function () {
    return State.find();
  });

  Meteor.publish("answers", function () {
    return Answers.find();
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
