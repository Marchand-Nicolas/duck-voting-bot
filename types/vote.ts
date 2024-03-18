export type ScheduledVote = {
  id: number;
  ducks: string;
  start_date: Date;
  end_date: Date;
  image: string;
  channelId: string;
  messageId: string;
  started: boolean;
  ended: boolean;
};

export type Vote = {
  id: number;
  scheduled_vote_id: number;
  user_id: string;
  duck_name: string;
};
