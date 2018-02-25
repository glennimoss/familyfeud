import { State, Answers, getState } from '/imports/state.js';

const snd_correct = new Audio('/ff-clang-full.mp3')
    , snd_no1_answer = new Audio('/ff-no1-answer-loud.mp3')
    , snd_strike = new Audio('/ff-strike-alt.mp2')
    , snd_theme = new Audio('/ff-commercial-break.mp3')
    ;

Template.answer_board.onCreated(function () {
  State.find("phase").observeChanges({
    changed (id, changes) {
      debug
      if (changes.value == "reveal") {
        snd_theme.play();
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

function getQuestion () {
  return State.findOne("question").value;
}

Template.answer_board.helpers({
  answers: function () {
    return Answers.find({}, {sort: ["_id"]});
  },
  question: getQuestion,
  scoreFactor: function () {
    const question = getQuestion();
    if (question.factor == 2) {
      return "DOUBLE";
    } else if (question.factor == 3) {
      return "TRIPLE";
    }
  },
});

Template.strikes.helpers({
  showStrikes: getState('showStrikes'),
  numStrikes:  getState('numStrikes', function (numStrikes) {
    if (getState('phase')() != 'play') {
      numStrikes = 1;
    }
    return new Array(numStrikes).fill(1);
  }),
  play_strike () {
    snd_strike.play();
    $('.strike').show();
  },
});



