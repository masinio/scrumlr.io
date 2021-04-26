export interface JoinRequestServerModel extends Parse.Object {
  objectId: string;
  board: Parse.Object;
  user: Parse.Object;
  status: "pending" | "accepted" | "rejected";
  updatedAt: Date;
  createdAt: Date;
}

export interface JoinRequestClientModel {
  id: string;
  userId: string;
  displayName: string;
  boardId: string;
  status: "pending" | "accepted" | "rejected";
}

export const mapJoinRequestServerToClientModel = (joinRequest: JoinRequestServerModel) => ({
  id: joinRequest.id,
  userId: joinRequest.get("user").id,
  displayName: joinRequest.get("user").get("displayName"),
  boardId: joinRequest.get("board").id,
  status: joinRequest.get("status"),
});
