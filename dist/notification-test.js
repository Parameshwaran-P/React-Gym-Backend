"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = require("./modules/notifications/services/notification.service");
const prisma_1 = __importDefault(require("./config/prisma"));
async function simpleTest() {
    console.log('🧪 Starting Simple Notification Test...\n');
    try {
        // Step 1: Find or create a test user
        console.log('1️⃣ Finding test user...');
        let user = await prisma_1.default.user.findFirst();
        if (!user) {
            console.log('   No user found, creating test user...');
            user = await prisma_1.default.user.create({
                data: {
                    email: 'test@example.com',
                    passwordHash: '$2b$12$abcdefghijklmnopqrstuvwxyz', // dummy hash
                    displayName: 'Test User',
                },
            });
        }
        console.log('   ✅ User:', user.email, '(ID:', user.id, ')');
        // Step 2: Send a notification
        console.log('\n2️⃣ Sending notification...');
        const notificationService = new notification_service_1.NotificationService();
        await notificationService.sendNotification({
            userId: user.id,
            type: 'COURSE_PURCHASED',
            title: 'Test Notification',
            message: 'This is a test message to verify the notification system works',
            channels: ['EMAIL'],
            metadata: {
                testData: 'This is a test',
            },
        });
        console.log('   ✅ Notification queued successfully');
        // Step 3: Check database
        console.log('\n3️⃣ Checking database...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        console.log(`   ✅ Found ${notifications.length} notification(s) in database`);
        if (notifications.length > 0) {
            console.log('\n📧 Latest Notification:');
            console.log('   ID:', notifications[0].id);
            console.log('   Type:', notifications[0].type);
            console.log('   Title:', notifications[0].title);
            console.log('   Channel:', notifications[0].channel);
            console.log('   Status:', notifications[0].status);
            console.log('   Created:', notifications[0].createdAt);
        }
        console.log('\n✅ TEST PASSED - Notification system is working!');
    }
    catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
// Run the test
simpleTest();
