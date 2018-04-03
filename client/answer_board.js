import { State, Answers, getState, Helpers } from '/imports/state.js';
import snd from '/imports/audio.js';


Template.answer_board.onCreated(function () {
  State.find("phase").observeChanges({
    changed (id, changes) {
      debug
      if (changes.value == "reveal") {
        snd.win.play();
      }
    }
  });
});

Template.answer_board.onRendered(function () {
  $(".lights .row").each(function (idx, e) {
    const delay = Math.max(idx-26, 25-idx, 0)*10;
    e.style.animationDelay = `${delay}ms`;
  });

  $(".ans-text").each(function (idx, targetNode) {
    scaleText(targetNode);

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList) {
      scaleText(targetNode);
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, { childList: true });
  });
});

Template.answer_board.helpers({
  answers: function () {
    return Answers.find({}, {sort: ["_id"]});
  },
  scoreFactor: function () {
    const question = getState("question");
    if (question.factor == 2) {
      return "DOUBLE";
    } else if (question.factor == 3) {
      return "TRIPLE";
    }
  },
});

/*
Template.strikes.helpers({
  showStrikes: get State('showStrikes'),
  numStrikes:  get State('numStrikes', function (numStrikes) {
    if (getState('phase')() != 'play') {
      numStrikes = 1;
    }
    return new Array(numStrikes).fill(1);
  }),
  play_strike () {
    snd.strike.play();
    $('.strike').show();
  },
});
*/



