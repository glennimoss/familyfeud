Meteor.subscribe("state");

Template.dispatcher.path = function (val) {
  return window.location.pathname == val
};

Handlebars.registerHelper('screen', ifState('screen'));

Handlebars.registerHelper("let", function (name, value) {
  this[name] = value;
});

Handlebars.registerHelper("plus", function (v1, v2) {
  return v1 + v2;
});

Handlebars.registerHelper("max", function (v1, v2) {
  return Math.max(v1, v2);
});

Handlebars.registerHelper("and", function (v1, v2) {
  return v1 && v2;
});

Handlebars.registerHelper("or", function (v1, v2) {
  return v1 || v2;
});

Handlebars.registerHelper("eq", function (v1, v2) {
  return v1 == v2;
});

Handlebars.registerHelper("neq", function (v1, v2) {
  return v1 != v2;
});


Handlebars.registerHelper("ntimes", function (times, options) {
  console.log("called ntimes");
  var out = ""
    , offset = this._offset || 0;
  debugger;
  for (var i=0; i < times; i++) {
    out += Spark.labelBranch("ntimes" + i, function () {
      return options.fn({_index: offset + i, _ord: offset + i + 1});
    });
  }
  return out;
});

Handlebars.registerHelper("foreach", function (list, options) {
  if (!list) {
    return;
  }
  var out = ""
    , offset = this._offset || 0;
  for (var i=0; i < list.length; i++) {
    var context = _.extend({_index: offset + i}, list[i])
    out += Spark.labelBranch("foreach" + i, function () {
      return options.fn(context);
    });
  }
  return out;
});

Handlebars.registerHelper("upper", function (text) {
  return text.toUpperCase();
});

Handlebars.registerHelper("by5s", function (list, options) {
  if (!list) {
    return;
  }
  var out = ""
    , size = 5; // TODO: why doesn't this work? options.hash['groups_of'];
  for (var i=0; i < list.length; i += size) {
    var group = list.slice(i, i+size);

    out += options.fn({
      _offset: i,
      group: group,
      num_leftover: size - group.length,
    });
  }
  return out;
});

Handlebars.registerHelper("debug", function (obj) {
  console.dir(obj);
});


var snd_theme = new Audio('/ff-theme-short.mp3');

Template.logo.question_set = getState('question_set');
Template.logo.play_theme = function () {
  snd_theme.play();
}
