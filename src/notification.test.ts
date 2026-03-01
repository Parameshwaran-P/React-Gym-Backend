import { NotificationService } from '@/modules/notifications/services/notification.service';
import { describe, it } from 'vitest';

describe('Notification System', () => {
  it('should send email notification', async () => {
    const service = new NotificationService();
    
    await service.sendNotification({
      userId: 'test-user-id',
      type: 'COURSE_PURCHASED',
      title: 'Test',
      message: 'Test message',
      channels: ['EMAIL'],
    });
    
    // Check database
    // Verify email was sent
  });
});