import { State, Answers, getState, Helpers } from '/imports/state.js';
import { Events } from '/imports/events.js';
import snd from '/imports/audio.js';


Template.answer_board.onCreated(function () {
  State.find("phase").observeChanges({
    changed (id, changes) {
      if (changes.value == "reveal") {
        snd.win.play();
      }
    }
  });

  Answers.find().observeChanges({
    changed (id, changes) {
      if (changes.flipside == "side2") {
        if (id == "a0") {
          snd.no1_answer.play();
        } else {
          snd.correct.play();
        }
      }
    }
  });


  console.log("Registring for strike event");
  Events.on("strike", function (n) {
    console.log("Received strike", n);
    const strikeClass = `strike${n}`
        , strikeDiv = $("#strikes")
        ;

    strikeDiv.addClass(strikeClass);
    snd.strike.play();
    Meteor.setTimeout(() => strikeDiv.removeClass(strikeClass), 1500);
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
