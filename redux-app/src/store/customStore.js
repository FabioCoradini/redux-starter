import reducer from "./reducer";

function createStore(reducer) {
  let state;
  let listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
  }

  function getState() {
    return state;
  }

  function dispatch(action) {
    // Call the reducer to get the new state
    state = reducer(state, action);

    // Notify the subcribers
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  return {
    subscribe,
    getState,
    dispatch,
  };
}

let store = createStore(reducer);
export default store;
