import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import configureStore from "../configureStore";
import {
  addBug,
  assingToUser,
  resolveBug,
  getUnresolvedBugs,
  getBugsByUser,
  loadBugs,
} from "../bugs";

describe("bugsSlice", () => {
  let fakeAxios;
  let store;

  beforeEach(() => {
    fakeAxios = new MockAdapter(axios); // This sets the mock adapter on the default instance
    store = configureStore();
  });

  // Helper functions
  const bugsSlice = () => store.getState().entities.bugs;

  // Helper functions
  const createState = () => ({
    entities: {
      bugs: {
        list: {},
      },
    },
  });

  it("should add bug to the store it's saved to the server", async () => {
    /// AAA = Arrange, Act, Assert
    const bug = { description: "a" };
    const savedBug = { ...bug, id: 1 };
    fakeAxios.onPost("/bugs").reply(200, savedBug);

    await store.dispatch(addBug(bug));

    expect(bugsSlice().list).toContainEqual(savedBug);
  });

  it("should not add bug to the store it's not  saved to the server", async () => {
    const bug = { description: "a" };
    fakeAxios.onPost("/bugs").reply(500);

    await store.dispatch(addBug(bug));

    expect(bugsSlice().list).toHaveLength(0);
  });

  it("should assing bug to an user.", async () => {
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });
    fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, userId: 1 });

    await store.dispatch(addBug({}));
    await store.dispatch(assingToUser(1, 1));

    expect(bugsSlice().list[0].userId == 1).toBe(true);
  });

  it("should mark the bug as resolved if it's saved to the server.", async () => {
    // AAA
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });
    fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, resolved: true });

    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    expect(bugsSlice().list[0].resolved).toBe(true);
  });

  it("should not mark the bug as resolved if it's not saved to the server.", async () => {
    // AAA
    fakeAxios.onPatch("/bugs/1").reply(500);
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });

    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    expect(bugsSlice().list[0].resolved).not.toBe(true);
  });

  describe("selectors", () => {
    it("getUnresolvedBugs", async () => {
      // AAA
      const state = createState();
      state.entities.bugs.list = [
        { id: 1, resolved: true },
        { id: 2 },
        { id: 3 },
      ];

      const result = getUnresolvedBugs(state);

      expect(result).toHaveLength(2);
    });

    it("getBugsByUser", async () => {
      // AAA
      const state = createState();
      state.entities.bugs.list = [{ id: 1, userId: 1 }, { id: 2 }, { id: 3 }];

      const result = getBugsByUser(1)(state);

      expect(result).toHaveLength(1);
    });
  });

  describe("loading bugs", () => {
    describe("if the bugs exist in the cache", () => {
      it("they should not be fetched from the server again.", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs());
        await store.dispatch(loadBugs());

        expect(fakeAxios.history.get.length).toBe(1);
      });
    });

    describe("if the bugs don't exist in the cache", () => {
      it("they should be fetched from the server and put in the store", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs());

        expect(bugsSlice().list).toHaveLength(1);
      });

      describe("loading indicator", () => {
        it("should be true while fetching the bugs", () => {
          fakeAxios.onGet("/bugs").reply(() => {
            expect(bugsSlice().loading).toBe(true);
            return [200, [{ id: 1 }]];
          });

          store.dispatch(loadBugs());
        });

        it("should be false after the bugs are fetched", async () => {
          fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

          await store.dispatch(loadBugs());

          expect(bugsSlice().loading).toBe(false);
        });

        it("should be false if the server returns an error", async () => {
          fakeAxios.onGet("/bugs").reply(500);

          await store.dispatch(loadBugs());

          expect(bugsSlice().loading).toBe(false);
        });
      });
    });
  });
});
