State = new Meteor.Collection("state");

this.getState = function (key, fn) {
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

this.ifState = function (key) {
  return this.getState(key, function (curval, testval) {
    return curval == testval;
  });
}

this.set_state = function (keys, val) {
  if (!_.isObject(keys)) {
    var obj = {};
    obj[keys] = val;
    keys = obj;
  }

  for (var key in keys) {
    State.update(key, {value: keys[key]});
  }
}
