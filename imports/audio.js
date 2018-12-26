const origPlay = Audio.prototype.play;

Audio.prototype.play = function () {
  this.currentTime = 0;
  return origPlay.apply(this, arguments);
}

export
const correct = new Audio('/ff-clang-full.mp3')
    , no1_answer = new Audio('/ff-no1-answer-loud.mp3')
    , strike = new Audio('/ff-strike-alt.mp3')
    , win = new Audio('/ff-commercial-break.mp3')
    , theme = new Audio('/ff-theme-short.mp3')
    , blip = new Audio('/ff-blip.wav')
    , bell = new Audio('/ff-bell.wav')
    , zero = new Audio('/ff-zero.wav')
    , buzz = new Audio('/ff-ringin.wav')
    , fm_already_answered = new Audio('/ff-tryagn2.wav')
    ;

