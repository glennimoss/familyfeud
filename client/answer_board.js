var snd_correct = new Audio('/ff-clang-full.mp3')
  , snd_no1_answer = new Audio('/ff-no1-answer-loud.mp3')
  , snd_strike = new Audio('/ff-strike-alt.mp3')
  , snd_theme = new Audio('/ff-commercial-break.mp3')
  ;


 /*
Template.answer_board.isFlipped = function () {
  var flipped = Deps.nonreactive(getState('flipped'));

  if (flipped[this._index]) {
    return " flipped";
  }
  flipped[this._index] = true;
}
*/

Template.answer_board.question = getState('question');

Template.answer_board.pending_score = getState('pending_score');
Template.answer_board.score_team1 = getState('score_team1');
Template.answer_board.score_team2 = getState('score_team2');
Template.answer_board.control = ifState('control');

Template.answer_cell.thisAnswer = getState('question', function (question) {
  var idx = this.ord - 1; //this._offset + this._index;
  if (idx < question.answers.length) {
    return _.extend({isActive: true}, question.answers[idx]);
  } else {
    return {isActive: false};
  }
});

Template.answer_board.animateFlips = getState('flipped', function (flipped) {
  $('.answer').each(function (idx, node) {
    if (flipped[idx] && !node.classList.contains('flipped')) {
      (idx == 0 ? snd_no1_answer : snd_correct).play();
      node.classList.add('flipped');
    } else if (!flipped[idx]) {
      node.classList.remove('flipped');
    }
  });
});

Template.answer_board.playTheme = getState('phase', function (phase) {
  if (phase == 'reveal') {
    snd_theme.play();
  }
});

Template.strikes.showStrikes = getState('showStrikes');

Template.strikes.numStrikes = getState('numStrikes', function (numStrikes) {
  if (getState('phase')() != 'play') {
    return 1;
  }
  return numStrikes;
});

Template.strikes.play_strike = function () {
  snd_strike.play();
  $('.strike').show();
}


