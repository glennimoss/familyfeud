import { State, getState, set_state } from '/imports/state.js';

var snd_blip = new Audio('/ff-blip.wav')
  , snd_bell = new Audio('/ff-bell.wav')
  , snd_zero = new Audio('/ff-zero.wav');

var currentAns = 0;
Template.fast_money.animateAnswers = getState('fm_answer',
  function (fm_answer) {
    if (!fm_answer) {
      return;
    }

    if (fm_answer == 'hide') {
      $('.container:lt(5) .field span').hide();
      return
    }
    if (fm_answer == 'show') {
      $('.container:lt(5) .field span').show();
      return
    }

    var cell = $('.container').eq(currentAns++);
    snd_blip.play();
    cell.find('.answer span').text(fm_answer.answer.toUpperCase())
        .typewriter(function () {
       cell.find('.score').append('<span class="typewriter-cursor">█</span>');
       Meteor.setTimeout(function () {
         cell.find('.typewriter-cursor').remove();
         (fm_answer.score == 0 ? snd_zero : snd_bell).play();
         cell.find('.score span').show();
         State.update('fm_total_score', {$inc: {value: fm_answer.score}});
       }, 2000);
    });
    cell.find('.score span').text(fm_answer.score);
  }
);

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

