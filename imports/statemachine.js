export class StateMachine {
  constructor (onStart) {
    this.states = {};

    this.onStart = onStart
  }

  addStartState (name, actions) {
    this.startState = this.addState(name, actions);
  }

  addEndState (name) {
    this.endState = this.addState(name);
  }

  addState (name, actions) {
    this.states[name] = new State(name, this, actions);
    return this.states[name];
  }

  getState (name) {
    if (name instanceof State && name.sm === this) {
      return name;
    }
    return this.states[name];
  }

  start (...args) {
    const inst = new StateMachineInstance(this);
    if (this.onStart) {
      this.onStart.apply(inst.scope, args);
    }
    return inst;
  }
}

class State {
  constructor (name, sm, actions) {
    this.name = name;
    this.sm = sm;
    this.actions = actions || {};
  }
}

class StateMachineInstance {
  constructor (sm) {
    this.sm = sm;
    this.scope = {};
    this.state = this.sm.startState;
    this.availableActions = null;
  }

  action (act, ...args) {
    const action = this.state.actions[act];
    if (!action) {
      throw new Error(`State ${this.state.name} has no action ${act}`);
    }
    let nextState = this.sm.getState(action);
    if (!nextState) {
      const transitionTo = action.apply(this.scope, args)
      nextState = this.sm.getState(transitionTo);
      if (!nextState) {
        throw new Error(`State ${this.state.name}'s action ${act} transitioned to non-existent state ${transitionTo}`);
      }
    }
    this.state = nextState
    console.log("Transitioned to state:", this.state.name)
    if (this.state.actions._) {
      console.log("This state has an incoming action");
      this.availableActions = this.state.actions._.call(this.scope);
    } else {
      this.availableActions = null;
    }
  }

  getActions () {
    if (!this.availableActions) {
      this.availableActions = Object.keys(this.state.actions);
      if (this.availableActions[0] == '_') {
        this.availableActions = this.availableActions.slice(1);
      }
    }

    return this.availableActions;
  }

  accepted () {
    return this.state == this.sm.endState;
  }
}
