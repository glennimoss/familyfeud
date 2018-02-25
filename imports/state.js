export const State = new Meteor.Collection("state");

export const Answers = new Meteor.Collection("answers");

export function getState (key, fn) {
  return function () {
    var obj = State.findOne(key);
    if (obj) {
      if (_.isFunction(fn)) {
        return fn.apply(this, [obj.value].concat(_.values(arguments)));
      }
      return obj.value;
    }
  }
}

export function set_state (keys, val) {
  if (!_.isObject(keys)) {
    var obj = {};
    obj[keys] = val;
    keys = obj;
  }

  for (var key in keys) {
    State.update(key, {value: keys[key]});
  }
}
