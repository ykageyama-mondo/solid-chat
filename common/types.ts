export type Message = TextMessage | JoinMessage | LeaveMessage

export interface TextMessage {
  id: string;
  text: string;
  timestamp: number;
  userName: string;
  type: 'text';
}

export interface JoinMessage {
  type: 'join';
  userName: string;
}

export interface LeaveMessage {
  type: 'leave';
  userName: string;
}

export interface RawMessage {
  type: 'message' | 'join' | 'leave';
  data: string;
}