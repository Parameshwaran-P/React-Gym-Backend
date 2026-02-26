import prisma from '../../config/prisma';

export class NotificationRepository {
  async create(data: any) {
    return prisma.notification.create({ data });
  }

  async updateStatus(id: string, status: string) {
    return prisma.notification.update({
      where: { id },
      data: { status },
    });
  }
}