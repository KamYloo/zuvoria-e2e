export type ChatRoomDto = {
  id: number;
  chatRoomName?: string | null;
  participants: Array<{ id?: number; email?: string; username?: string }>;
};

export type StoryDto = {
  id: number;
  image?: string;
  imageUrl?: string;
  timestamp?: string;
  expiresAt?: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
