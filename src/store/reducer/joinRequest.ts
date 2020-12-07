import {ActionType, ReduxAction} from "../action";
import {JoinRequestClientModel} from "../../types/joinRequest";

export const joinRequestReducer = (state: JoinRequestClientModel[] = [], action: ReduxAction): JoinRequestClientModel[] => {
    switch (action.type) {
        case ActionType.CreateJoinRequest: {
            return [...state, action.joinRequest]
        }
        case ActionType.InitializeJoinRequests: {
            return [...action.joinRequests]
        }
        case ActionType.UpdateJoinRequest: {
            const joinRequestIndex = state.findIndex((joinRequest) => joinRequest.id === action.joinRequest.id);
            const newState = [...state];
            newState.splice(joinRequestIndex, 1, action.joinRequest);
            return newState;
        }
    }
    return state;
}