import yaml from 'js-yaml';
import { Answers, State, getState, set_state } from '/imports/state.js';
import { Events } from '/imports/events.js';
import { RoundSM } from '/server/game.js';
import _ from 'lodash';

var questionsets = {}
  , freshBoard = {
  //phase: "faceoff",
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
  smState: null,
};

function magicfactor (n, m) {
  return Math.max(1, Math.round(4*n/m-1));
}

//const qsets = yaml.safeLoad(Assets.getText("wynn_youth_qs.yaml"));
const qsets = yaml.safeLoad(Assets.getText("canadian_questions.yaml"));
for (const [setname, qset] of Object.entries(qsets)) {
  questionsets[setname] = [];
  const qentries = Object.entries(qset);
  for (const [question, answers] of qentries) {
    const q = { question, factor: magicfactor(questionsets[setname].length + 1, qentries.length), answers: []}
    for (const [answer, score] of Object.entries(answers)) {
      q.answers.push({answer, score});
    }
    questionsets[setname].push(q);
  }
}

console.dir(questionsets, { depth: null });

var freshState = _.extend({}, freshBoard, {
  screen: "logo",
  score_team1: 0,
  score_team2: 0,
  q_num: 0,
  //phase: "pregame",
  all_question_sets: _.keys(questionsets),
  all_questions: [],
  fm_answer: null,
});

var reset = function () {
  console.log("Resetting...");
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

/*
function win () {
  var team = getState('control');
  State.update(`score_${team}`, {$inc: {value: getState('pending_score')}});
  set_state({
    pending_score: 0,
    phase: "reveal",
  });
}
*/

function invertedControl  () {
  return getState('control') == 'team1' ? 'team2' : 'team1';
}

let currentRound;
function updateSM () {
  set_state({smState: currentRound.state.name});
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
      , questions = State.findOne('all_questions').value
      ;

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
                           answer: _.get(ans, "answer", ""),
                           score: _.get(ans, "score", 0),
                         }});
        }
      }, 500);

      currentRound = RoundSM.start(state.question);
      updateSM();

    } else {
      reset();
    }
  },
  /*
  strike: function () {
    console.log("Strike!");

    const phase = getState("phase");
    let numStrikes = getState("numStrikes");

    if (phase == "play") {
      numStrikes++;
      const state = { numStrikes };

      if (numStrikes >= 3) {
        state.phase = "steal";
        state.control = invertedControl();
      }
      set_state(state);
    } else {
      numStrikes = 1;

      if (phase == "faceoff") {
        state.control = invertedControl();
      } else if (phase == 'steal') {
        Meteor.setTimeout(() => {
          set_state({control: invertedControl()});
          win();
        }, 1500);
      }
    }

    Events.emit("strike", numStrikes);
  },
  */
  choose_questionset: function (setname) {
    console.log("Chose questionset", setname);
    const state = {all_questions: questionsets[setname]};

    if (setname.search('Fast Money') == 0) {
      state.screen = 'fast-money';
      currentRound = FastMoneySM.start(state.all_questions);
      updateSM();
    }
    set_state(state);
    Events.emit("play-theme");
  },
  reset: reset,
  /*
  flip: function (idx) {
    const ans = Answers.findOne({_id: `a${idx}`});

    if (ans.flipside == "side1") {
      Answers.update({_id: `a${idx}`}, {$set: {flipside: "side2"}});
      State.update("pending_score", {$inc: { value: ans.score * getState("question").factor}});
    }

    const phase = getState('phase');
    if ((phase == 'play' && !Answers.findOne({flipside: "side1"})) ||
        phase == 'steal') {
      win();
    }
  },
  */
  doAction: function (act, ...args) {
    console.log("doAction:", act, args);
    currentRound.action(act, ...args);
    updateSM();
  }
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
