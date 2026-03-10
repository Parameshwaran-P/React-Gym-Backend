import nodemailer from 'nodemailer';
import { env } from './config/env';

async function diagnoseEmail() {
  console.log('🔍 Email Configuration Diagnosis\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Check environment variables
  console.log('1️⃣ CHECKING ENVIRONMENT VARIABLES:');
  console.log('   SMTP_HOST:', env.SMTP_HOST || '❌ NOT SET');
  console.log('   SMTP_PORT:', env.SMTP_PORT || '❌ NOT SET');
  console.log('   SMTP_USER:', env.SMTP_USER || '❌ NOT SET');
  console.log('   SMTP_PASSWORD:', env.SMTP_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('   EMAIL_FROM:', env.EMAIL_FROM || '❌ NOT SET');
  console.log('   EMAIL_FROM_NAME:', env.EMAIL_FROM_NAME || '❌ NOT SET');

  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.log('\n❌ SMTP credentials not configured in .env file');
    console.log('\n📝 Add these to your .env file:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_SECURE=false');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASSWORD=your-16-char-app-password');
    console.log('EMAIL_FROM=noreply@yourapp.com');
    console.log('EMAIL_FROM_NAME=Your App Name');
    return;
  }

  // Step 2: Test SMTP connection
  console.log('\n2️⃣ TESTING SMTP CONNECTION:');
  
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    console.log('   Connecting to', env.SMTP_HOST, 'on port', env.SMTP_PORT, '...');
    await transporter.verify();
    console.log('   ✅ SMTP connection successful!');

    // Step 3: Send test email
    console.log('\n3️⃣ SENDING TEST EMAIL:');
    console.log('   From:', env.EMAIL_FROM);
    console.log('   To:', env.SMTP_USER);

    const info = await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to: env.SMTP_USER, // Send to yourself
      subject: '✅ Test Email - Notification System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #4CAF50;">✅ Email System Working!</h1>
          <p>Congratulations! Your notification system can send emails.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from your notification system.
          </p>
        </div>
      `,
      text: 'Email system is working! Sent at: ' + new Date().toLocaleString(),
    });

    console.log('   ✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('\n📬 CHECK YOUR INBOX:', env.SMTP_USER);
    console.log('   (Check spam folder if not in inbox)');

  } catch (error: any) {
    console.log('   ❌ SMTP Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔑 AUTHENTICATION ERROR:');
      console.log('   Your Gmail password is incorrect.');
      console.log('   You need to use an "App Password", not your regular Gmail password.');
      console.log('\n   📝 How to create Gmail App Password:');
      console.log('   1. Go to: https://myaccount.google.com/security');
      console.log('   2. Enable "2-Step Verification" if not already enabled');
      console.log('   3. Go to: https://myaccount.google.com/apppasswords');
      console.log('   4. Select "Mail" and generate password');
      console.log('   5. Copy the 16-character password to .env as SMTP_PASSWORD');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🌐 CONNECTION ERROR:');
      console.log('   Cannot connect to SMTP server.');
      console.log('   Check your internet connection and firewall settings.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('\n⏱️ TIMEOUT ERROR:');
      console.log('   Connection timed out.');
      console.log('   Your network might be blocking SMTP port 587.');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

diagnoseEmail();