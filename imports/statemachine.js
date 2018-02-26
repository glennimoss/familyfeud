export class StateMachine {
  constructor (startName, endName, onStart) {
    this.states = {};

    this.startState = this.addState(startName);
    this.endState = this.addState(endName);
    this.onStart = onStart
  }

  addState (name, onArrived) {
    this.states[name] = new State(name, this, onArrived);
    return this.states[name];
  }

  addTransition (from, to, onTransition) {
    from = this.getState(from);
    to = this.getState(to);
    return from.addTransition(to);
  }

  getState (name) {
    if (name instanceof State && name.sm === this) {
      return name;
    }
    return this.states[name];
  }

  start () {
    const inst = new StateMachineInstance(this);
    if (this.onStart) {
      this.onStart.call(inst.scope);
    }
    return inst;
  }
}

class State {
  constructor (name, sm, onArrived) {
    this.name = name;
    this.sm = sm;
    this.onArrived = onArrived;
    this.transitions = {};
  }

  addTransition (to, onTransition) {
    to = this.sm.getState(to);
    if (!to) {
      to = this.sm.addState(to);
    }
    this.transitions[to.name] = new Transition(this, to, onTransition);
    return this.transitions[to.name];
  }
}

class Transition {
  constructor (from, to, onTransition) {
    this.from = from;
    this.to = to;
    this.onTransition = onTransition;
  }
}

class StateMachineInstance {
  constructor (sm) {
    this.sm = sm;
    this.scope = {};
    this.state = this.sm.startState;
  }

  getTransitions () {
    return Object.keys(this.state.transitions);
  }

  transition (to, ...args) {
    const trans = this.state.transitions[to];
    if (trans.onTransition) {
      trans.onTransition.apply(this.scope, args);
    }
    this.state = trans.to;
    if (this.state.onArrived) {
      this.state.onArrived.apply(this.scope); // , args); ???
    }
  }

  accepted () {
    return this.state == this.sm.endState;
  }
}
