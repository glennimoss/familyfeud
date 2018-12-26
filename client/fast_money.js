import { Events } from '/imports/events.js';
import { Answers, FMAnswers, State, getState, set_state, Helpers } from '/imports/state.js';
import snd from '/imports/audio.js';

var currentAns = 0;
Template.fast_money.onCreated(function () {
  Events.on("fm_hide", function () {
    $('.container:lt(5) .field span').hide();
  });
  Events.on("fm_show", function () {
    $('.container:lt(5) .field span').show();
  });
  console.log("Registering fm_reveal listener");
  Events.on("fm_reveal", function (idx, ans) {
    console.log("fm_reveal", idx, ans);
    var cell = $('.container').eq(idx);
    snd.blip.play();
    cell.find('.answer span').text(ans.answer.toUpperCase())
        .typewriter(function () {
       cell.find('.score').append('<span class="typewriter-cursor">&nbsp;&nbsp;</span>');
       Meteor.setTimeout(function () {
         cell.find('.typewriter-cursor').remove();
         (ans.score == 0 ? snd.zero : snd.bell).play();
         cell.find('.score span').show();
         State.update('fm_total_score', {$inc: {value: ans.score}});
         Answers.update({_id: `a${idx}`}, {$set: ans});
       }, 2000);
    });
    cell.find('.score span').text(ans.score);
  });
  Events.on("fm_already_answered", function () {
    snd.fm_already_answered.play();
  });
});
Template.fast_money.onDestroyed(function () {
  console.log("Turning off event subcriptions");

  Events.stop("fm_hide");
  Events.stop("fm_show");
  Events.stop("fm_reveal");
});
/*
Template.fast_money.onRendered(function () {
  this.$("div.container").each(function () {
    this._uihooks = {
      insertElement: function(node, next) {
        debugger;
      },
      moveElement: function(node, next) {
        debugger;
      },
      removeElement: function(node, done) {
        debugger;
      }
    }
  });
  this.$("div.field").each(function () {
    this._uihooks = {
      insertElement: function(node, next) {
        debugger;
      },
      moveElement: function(node, next) {
        debugger;
      },
      removeElement: function(node, done) {
        debugger;
      }
    }
  });
});
*/

Template.fast_money.helpers({
  answers: Helpers.answers,
});

Template.fm_round.helpers({
  isPrevAnswer: function (qidx, aidx) {
    console.log(`isPrevAnswer ${qidx} ${aidx}`);
    const prev = FMAnswers.findOne({_id: `a${qidx}`});
    console.log(prev);
    return prev && prev.ans == aidx;
  },
});
Template.fm_round.events({
  'click form#fast-money button.prev': function (event) {
    Events.emit("fm_already_answered");
  },
  'click form#fast-money button#done': function (event) {
    const answers = $('#fast-money').serializeArray();
    Meteor.call("doAction", "done", answers);
  },
});
Template.fm_end.events({
  'click #fm-over': function () {
    Meteor.call('reset');
  },
});

  /*
var fm_ans = null
  , fm_ans_pos = 0
  , times_around = 0;


Template.fast_money_controller.events({
  'click #fm-done': function () {
    var form = $('#fast-money').serializeArray();

    fm_ans = [];
    for (var i = 0; i < form.length; i += 2) {
      if (form[i].value > -1) {
        fm_ans.push(form[i].value);
      } else if (form[i].value == -1) {
        fm_ans.push(form[i+1].value || " ");
      }
    }
    $("#fm-done").hide();
    $("#fm-reveal").show();
  },
  'click #fm-reveal': function () {
    if (times_around == 1) {
      set_state({fm_answer: 'show'});
      $('#fm-reveal').text('Reveal next answer');
      times_around += 1;
      return;
    }
    if (times_around == 3) {
      times_around = 0;
      Meteor.call('reset');
      return;
    }
    var all_questions = getState('all_questions');
    if (fm_ans_pos >= all_questions.length) {
      fm_ans_pos = 0;

      set_state({fm_answer: 'hide'});
      $('#fast-money :checked[value!=-1]').attr('disabled', 'true');
      $('#fast-money')[0].reset();

      $('#fm-reveal').text('Show answers').hide();
      $("#fm-done").show();

      times_around += 1;

      return;
    }
    var good_answer = all_questions[fm_ans_pos].answers[fm_ans[fm_ans_pos]];

    set_state({
      fm_answer: {
        answer: good_answer ? good_answer.answer : fm_ans[fm_ans_pos],
        score:  good_answer ? good_answer.score : 0,
      },
    });

    fm_ans_pos++;

    if (fm_ans_pos >= all_questions.length) {
      if (times_around == 2) {
        $('#fm-reveal').text('Reset');
        times_around += 1;
      } else {
        $("#fm-reveal").text('Hide Answers');
      }
    }
  },
});
*/

