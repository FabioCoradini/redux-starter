import { createAction, createReducer, createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import { createSelector } from "reselect";
import { apiCallBegan } from "./api";

const slice = createSlice({
  name: "bugs",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null, // timestamp: usefull when implementing fetching
  },
  reducers: {
    bugsRequested: (bugs, action) => {
      bugs.loading = true;
    },
    bugsReceived: (bugs, action) => {
      bugs.list = action.payload;
      bugs.loading = false;
      bugs.lastFetch = Date.now();
    },
    bugsRequestFailed: (bugs, action) => {
      bugs.loading = false;
    },
    bugAdded: (bugs, action) => {
      bugs.list.push(action.payload);
    },
    bugResolved: (bugs, action) => {
      const index = bugs.list.findIndex((bug) => bug.id === action.payload.id);
      bugs.list[index].resolved = true;
    },
    bugRemoved: (bugs, action) => {
      bugs.list.filter((bug) => bug.id !== action.payload.id);
    },
    bugAssingedToUser: (bugs, action) => {
      const { id: bugId, userId } = action.payload;
      const index = bugs.list.findIndex((bug) => bug.id === bugId);
      bugs.list[index].userId = userId;
    },
  },
});

const {
  bugAdded,
  bugResolved,
  bugRemoved,
  bugAssingedToUser,
  bugsReceived,
  bugsRequested,
  bugsRequestFailed,
} = slice.actions;

export default slice.reducer;

// Action Creators
const url = "/bugs";

export const loadBugs = () => (dispatch, getState) => {
  const { lastFetch } = getState().entities.bugs;

  const diffInMinutes = moment().diff(moment(lastFetch), "minutes");
  if (diffInMinutes < 10) return;

  return dispatch(
    apiCallBegan({
      url,
      onStart: bugsRequested.type,
      onSuccess: bugsReceived.type,
      onError: bugsRequestFailed.type,
    })
  );
};

export const addBug = (bug) =>
  apiCallBegan({
    url,
    method: "post",
    data: bug,
    onSuccess: bugAdded.type,
  });

export const resolveBug = (id) =>
  apiCallBegan({
    url: url + "/" + id,
    method: "patch", // same as PUT. Used to update data
    data: { resolved: true },
    onSuccess: bugResolved.type,
  });

export const assingToUser = (bugId, userId) =>
  apiCallBegan({
    url: url + "/" + bugId,
    method: "patch",
    data: { userId },
    onSuccess: bugAssingedToUser.type,
  });

// Selector

// export const getUnresolvedBugs = state => ... unresolvedBugs
// we are using createSelector() for memoazing solution only (do not confunding with the sintax)
export const getUnresolvedBugs = createSelector(
  (state) => state.entities.bugs,
  (state) => state.entities.projects,
  (bugs, projects) => bugs.list.filter((bug) => !bug.resolved)
);

export const getBugsByUser = (userId) =>
  createSelector(
    (state) => state.entities.bugs,
    (bugs) => bugs.list.filter((bug) => bug.userId === userId)
  );
