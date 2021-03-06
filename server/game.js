import { Answers, FMAnswers, State, getState, set_state, stateProp } from '/imports/state.js';
import { Events } from '/imports/events.js';
import { StateMachine } from '/imports/statemachine.js';
import _ from 'lodash';

function revealAnswer (idx, score=true) {
  console.log(`revealAnswer(${idx}, ${score})`);
  if (score && this.answered[idx]) {
    throw new Error(`Already answered ${idx}`);
  }

  this.answered[idx] = true;
  Answers.update({_id: `a${idx}`}, {$set: {flipside: "side2"}});

  if (score) {
    this.pending_score += this.question.answers[idx].score * this.question.factor;
  }
}

function winTransition (s) {
  State.update(`score_${s.control}`, {$inc: {value: s.pending_score}});
  s.pending_score = "";

  Events.emit("win");

  if (_.every(s.answered)) {
    return 'end-round';
  }

  s.revealIdx = -1;
  while (s.answered[++s.revealIdx]);

  return 'revealAnswers';
}

RoundSM = new StateMachine(function (question) {
  this.question = question;
  this.answered = new Array(question.answers.length);

  stateProp(this, 'pending_score');
  stateProp(this, 'control');
  stateProp(this, 'numStrikes');

  this.pending_score = 0;
  this.control = null;
  this.numStrikes = 0;
  this.winner = null;

  this.invertControl = function () {
    this.control = this.control == "team1" ? "team2" : "team1";
  };
});
RoundSM.addStartState("pregame", {
  begin: 'face-off',
});
RoundSM.addState('face-off', {
  _: function () {
    this.faceoffStrike = false;
    this.lastFaceOffAnswer = null;
    this.control = null;
  },
  buzz: function (T) {
    Events.emit('buzz-in', T);
    this.control = T;

    return 'buzzed-in';
  },
});
RoundSM.addState('buzzed-in', {
  correctGuess: function (idx) {
    revealAnswer.call(this, idx);

    if (idx == 0) {
      return 'play-or-pass';
    }

    this.lastFaceOffAnswer = idx;
    return 'faceoff-steal';
  },
  strike: function () {
    Events.emit("strike", 1);

    this.faceoffStrike = true;
    return 'faceoff-steal';
  },
});
RoundSM.addState('faceoff-steal', {
  _: function () {
    this.invertControl();
  },
  correctGuess: function (idx) {
    revealAnswer.call(this, idx);

    if (this.lastFaceOffAnswer && idx > this.lastFaceOffAnswer) { // Not better
      this.invertControl();
    }
    return 'play-or-pass';
  },
  strike: function () {
    Events.emit("strike", 1);
    if (this.faceoffStrike) {
      return 'face-off';
    }
    this.invertControl();
    return 'play-or-pass';
  },
});
RoundSM.addState('play-or-pass', {
  _: function () {
    this.numStrikes = 0;
  },
  play: 'answer',
  pass: function () {
    this.invertControl();

    return 'answer';
  },
});
RoundSM.addState('answer', {
  correctGuess: function (idx) {
    revealAnswer.call(this, idx);

    if (_.every(this.answered)) {
      return winTransition(this);
    }
    return 'answer';
  },
  strike: function () {
    this.numStrikes++;
    Events.emit("strike", this.numStrikes);

    if (this.numStrikes >= 3) {
      return 'steal';
    }
    return 'answer';
  },
});
RoundSM.addState('steal', {
  _: function () {
    this.invertControl();
  },
  correctGuess: function (idx) {
    revealAnswer.call(this, idx);
    return winTransition(this);
  },
  strike: function () {
    Events.emit("strike", 1);

    this.invertControl();
    return winTransition(this);
  },
});
RoundSM.addState('revealAnswers', {
  revealNext: function () {
    revealAnswer.call(this, this.revealIdx, false);

    while (this.answered[++this.revealIdx]);

    if (this.revealIdx < this.answered.length) {
      return 'revealAnswers';
    }
    return 'end-round';
  },
});
RoundSM.addEndState('end-round');

export { RoundSM };


/* Example:

import { getState } from '/imports/state.js';
import { RoundSM } from '/server/game.js';

sm = RoundSM.start(getState('question'));

sm.state.name
sm.action('begin');
sm.action('buzz', 'team1');
sm.action('correctGuess', 0);
sm.action('play');
sm.action('answer', 3);
sm.action('answer', 5);
sm.action('answer', 7);
sm.action('strike');
sm.action('strike');
sm.action('strike');
sm.action('answer', 2);
sm.action('revealAnswers');
sm.action('revealNext');

OR
sm.action('correctAnswer', 4);

sm.action('correctAnswer', 2);

sm.action('play');

*/

FastMoneySM = new StateMachine(function (questions) {
  FMAnswers.remove({});

  this.questions = questions;
  this.firstPlayerAnswers = null;
  this.secondPlayerAnswers = null;
  stateProp(this, 'fm_reveal_idx');
  this.fm_reveal_idx = 0;
});
FastMoneySM.addStartState("fm_start", {
  begin: 'fm_round',
});
FastMoneySM.addState('fm_round', {
  done: function (submission) {
    console.log("Received:", submission);
    const guesses = {}, answers = [];
    for (let e of submission) {
      guesses[e.name] = e.value;
    }
    for (let i=0; i<5; i++) {
      if (guesses[`q${i}`] == -1) {
        answers.push({answer: guesses[`q${i}_other`], score: 0});
      } else {
        answers.push(this.questions[i].answers[guesses[`q${i}`]]);
      }
    }
    console.log("Answers:", answers);
    if (!this.firstPlayerAnswers) {
      for (let i=0; i<5; i++) {
        FMAnswers.insert({
          _id: `a${i}`,
          ans: guesses[`q${i}`],
        });
      }

      console.log(FMAnswers.find({}).fetch());

      this.firstPlayerAnswers = answers;
    } else {
      this.secondPlayerAnswers = answers;
    }

    return "fm_reveal_answers";
  },
});
FastMoneySM.addState('fm_reveal_answers', {
  revealNext: function () {
    const ans = (this.secondPlayerAnswers || this.firstPlayerAnswers)[this.fm_reveal_idx % 5];
    console.log("Emitting fm_reveal");
    Events.emit("fm_reveal", this.fm_reveal_idx, ans);
    this.fm_reveal_idx++;
    if (this.fm_reveal_idx != 5 && this.fm_reveal_idx < 10) {
      return 'fm_reveal_answers';
    }

    if (!this.secondPlayerAnswers) {
      return 'hide_playerone_answers';
    }
    return 'fm_end';
  },
});
FastMoneySM.addState('hide_playerone_answers', {
  hide: function () {
    Answers.update({_id: {$lt: "a5"}}, {$set: {answer: "", score: 0}}, { multi: true});

    return 'show_playerone_answers';
  },
});
FastMoneySM.addState('show_playerone_answers', {
  show: function () {
    for (let i=0; i<5; i++) {
      Answers.update({_id: `a${i}`}, {$set: this.firstPlayerAnswers[i]});
    }


    return 'fm_start';
  },
});
FastMoneySM.addEndState('fm_end');

export { FastMoneySM };
