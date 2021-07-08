import {UsersState} from "../../../types/store";
import {usersReducer} from "../users";
import {ActionFactory} from "../../action";
import {UserClientModel} from "../../../types/user";

const createUser = (id: string, name: string, admin: boolean, ready = true): UserClientModel => ({
  id,
  displayName: name,
  admin,
  createdAt: new Date(),
  updatedAt: new Date(),
  online: true,
  ready: false,
});

describe("users reducer", () => {
  let initialState: UsersState;

  beforeEach(() => {
    initialState = {
      admins: [],
      basic: [],
      all: [],
      readyUsers: [],
    };
  });

  test("add admins", () => {
    const admin = createUser("1", "John Doe", true);
    const newState = usersReducer(initialState, ActionFactory.setUsers([admin], true));

    expect(newState.admins).toEqual([admin]);
    expect(newState.all).toEqual([admin]);
    expect(newState.basic).toEqual([]);
  });

  test("add basic", () => {
    const user = createUser("2", "Jane Doe", false);
    const newState = usersReducer(initialState, ActionFactory.setUsers([user], false));

    expect(newState.basic).toEqual([user]);
    expect(newState.all).toEqual([user]);
    expect(newState.admins).toEqual([]);
  });

  test("merge admins and basic users", () => {
    const admin = createUser("1", "John Doe", true);
    const user = createUser("2", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
    const state2 = usersReducer(state1, ActionFactory.setUsers([admin], true));

    expect(state2.admins).toEqual([admin]);
    expect(state2.basic).toEqual([user]);
    expect(state2.all).toContainEqual(admin);
    expect(state2.all).toContainEqual(user);
  });

  test("set user status correctly offline/online", () => {
    const user = createUser("1", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
    expect(state1.all.find((u) => u.id === user.id)?.online).toBe(true);

    const state2 = usersReducer(state1, ActionFactory.setUserStatus(user.id, false));
    expect(state2.all.find((u) => u.id === user.id)?.online).toBe(false);

    const state3 = usersReducer(state2, ActionFactory.setUserStatus(user.id, true));
    expect(state3.all.find((u) => u.id === user.id)?.online).toBe(true);
  });

  test("set user ready/unready", () => {
    const user = createUser("1", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
    expect(state1.all.find((u) => u.id === user.id)?.ready).toBe(false);

    const state2 = usersReducer(state1, ActionFactory.setUserReadyStatus(user.id, true));
    expect(state2.all.find((u) => u.id === user.id)?.ready).toBe(true);
    expect(state2.readyUsers.includes(user.id)).toBe(true);

    const state3 = usersReducer(state2, ActionFactory.setUserReadyStatus(user.id, false));
    expect(state3.all.find((u) => u.id === user.id)?.ready).toBe(false);
    expect(state3.readyUsers.includes(user.id)).toBe(false);

    // TODO frontend Tests
  });
});
