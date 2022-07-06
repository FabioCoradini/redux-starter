import store from "./store";
import { bugAdded, bugRemoved, bugResolved } from "./actions";

// subscribe:   called every time when the state has changes.
// unsubscribe: To unsubscribe the change listener, invoke the function returned by subscribe.

const unsubscribe = store.subscribe(() => {
  console.log("Store changed", store.getState());
});

store.dispatch(bugAdded("Bug 1"));
store.dispatch(bugAdded("Bug 2"));
store.dispatch(bugResolved(1));
store.dispatch(bugRemoved(1));
