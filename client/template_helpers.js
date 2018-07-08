import { State, getState } from '/imports/state.js';
import _ from 'lodash';

Template.registerHelper('state', getState);

Template.registerHelper('range', function (n, m) {
  if (typeof m != 'number') {
    m = n;
    n = 1;
  }
  let a = [];
  for (let i=n; i<=m; i++) {
    a.push({ord: i});
  }
  return a;
});

Template.registerHelper('slice', function (a, n, m) {
  if (typeof m != 'number') {
    m = undefined;
  }
  return a.slice(n, m);
});


Template.registerHelper('plus', (v1, v2) => v1 + v2);
Template.registerHelper('sub', (v1, v2) => v1 - v2);
Template.registerHelper('min', (...args) => {
  let i = 0;

  while (!(args[i] instanceof Spacebars.kw)) i++;

  return Math.min(...args.slice(0, i));
});

/*
Template.registerHelper("max", function (v1, v2) {
  return Math.max(v1, v2);
});
*/

Template.registerHelper("not", function (v) {
  return v1 && v2;
});

Template.registerHelper("and", function (v1, v2) {
  return v1 && v2;
});

Template.registerHelper("or", function (v1, v2) {
  return v1 || v2;
});

Template.registerHelper("eq", function (v1, v2) {
  return v1 == v2;
});

Template.registerHelper("neq", function (v1, v2) {
  return v1 != v2;
});

Template.registerHelper("upper", function (text) {
  return text && text.toUpperCase();
});

Template.registerHelper("debug", function (obj) {
  console.dir(obj);
});

Template.registerHelper("pretty", _.startCase);

Template.registerHelper("in", function (needle, ...haystack) {
    return haystack.indexOf(needle) != -1;
});

Template.registerHelper("notin", function (needle, ...haystack) {
    return haystack.indexOf(needle) == -1;
});

