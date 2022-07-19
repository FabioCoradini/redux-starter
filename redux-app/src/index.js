import configureStore from "./store/configureStore";
import * as actions from "./store/api";
import { loadBugs, addBug } from "./store/bugs";

const store = configureStore();

// UI Layer

store.dispatch(addBug({ description: "a" }));
