export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  important: boolean;
  urgent: boolean;
  completed: boolean;
  createdAt: Date;
}

export enum QuadrantType {
  ImportantUrgent = 1,
  ImportantNotUrgent = 2,
  NotImportantUrgent = 3,
  NotImportantNotUrgent = 4
} 