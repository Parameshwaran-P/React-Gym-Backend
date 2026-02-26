export enum NotificationType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  WELCOME = 'WELCOME',
  LEVEL_UP = 'LEVEL_UP',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}