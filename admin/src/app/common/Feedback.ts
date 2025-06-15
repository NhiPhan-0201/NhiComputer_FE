export class Feedback {
  feedbackId!: number;
  user!: {
    userId: number;
    username?: string;

  };
  content!: string;
  createdAt!: Date;
  status!: boolean;
}
