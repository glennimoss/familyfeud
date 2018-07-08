export const State = new Meteor.Collection("state");

export function getState (key) {
  var obj = State.findOne(key);
  if (obj) {
    return obj.value;
  }
};

/*
getState (key, fn) {
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
*/

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

export const Answers = new Meteor.Collection("answers");

export const Helpers = {
  answers () {
    return Answers.find({}, {sort: ["_id"]});
  },
};

export function stateProp (obj, prop) {
  const underProp = `_${prop}`;
  Object.defineProperty(obj, prop, {
    get: function () {
      return this[underProp];
    },
    set: function (val) {
      console.log("Updating", prop, this[underProp], "->", val);
      this[underProp] = val;
      set_state({[prop]: val});
    },
  });
}
