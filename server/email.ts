// Email service using SendGrid integration
import sgMail from '@sendgrid/mail';

// Rush Enterprise configuration
const RUSH_CONFIG = {
  appName: 'Rush',
  domain: 'rush-enterprise.com',
  supportEmail: 'support@rush-enterprise.com',
  contactEmail: 'contact@rush-enterprise.com',
};

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    await client.send({
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email templates for different notification types

export async function sendBookingConfirmationEmail(
  renterEmail: string,
  renterName: string,
  vehicleName: string,
  startDate: string,
  endDate: string,
  totalCost: number
): Promise<boolean> {
  const subject = `Booking Confirmed - ${vehicleName}`;
  const formattedStart = new Date(startDate).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Your ride is confirmed!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${renterName},</h2>
        <p style="color: #666;">Great news! Your booking has been confirmed.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #FF6B35; margin-top: 0;">${vehicleName}</h3>
          <p style="margin: 10px 0;"><strong>Pick-up:</strong> ${formattedStart}</p>
          <p style="margin: 10px 0;"><strong>Return:</strong> ${formattedEnd}</p>
          <p style="margin: 10px 0; font-size: 18px;"><strong>Total:</strong> $${totalCost.toFixed(2)}</p>
        </div>
        
        <p style="color: #666;">Open the Rush app to view your trip details and contact the vehicle owner.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const text = `Hi ${renterName},\n\nYour booking for ${vehicleName} has been confirmed.\n\nPick-up: ${formattedStart}\nReturn: ${formattedEnd}\nTotal: $${totalCost.toFixed(2)}\n\nOpen the Rush app to view your trip details.\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: renterEmail, subject, text, html });
}

export async function sendNewBookingNotificationToOwner(
  ownerEmail: string,
  ownerName: string,
  renterName: string,
  vehicleName: string,
  startDate: string,
  endDate: string,
  totalCost: number
): Promise<boolean> {
  const subject = `New Booking Request - ${vehicleName}`;
  const formattedStart = new Date(startDate).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #004E89 0%, #FF6B35 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">You have a new booking!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${ownerName},</h2>
        <p style="color: #666;">${renterName} has booked your vehicle.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #004E89; margin-top: 0;">${vehicleName}</h3>
          <p style="margin: 10px 0;"><strong>Renter:</strong> ${renterName}</p>
          <p style="margin: 10px 0;"><strong>Pick-up:</strong> ${formattedStart}</p>
          <p style="margin: 10px 0;"><strong>Return:</strong> ${formattedEnd}</p>
          <p style="margin: 10px 0; font-size: 18px;"><strong>Your Earnings:</strong> $${(totalCost * 0.9).toFixed(2)}</p>
        </div>
        
        <p style="color: #666;">Open the Rush app to view the booking details and message the renter.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const text = `Hi ${ownerName},\n\n${renterName} has booked your vehicle ${vehicleName}.\n\nPick-up: ${formattedStart}\nReturn: ${formattedEnd}\nYour Earnings: $${(totalCost * 0.9).toFixed(2)}\n\nOpen the Rush app to view the booking details.\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: ownerEmail, subject, text, html });
}

export async function sendVehicleVerificationApprovedEmail(
  ownerEmail: string,
  ownerName: string,
  vehicleName: string
): Promise<boolean> {
  const subject = `Vehicle Approved - ${vehicleName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Your vehicle is approved!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Congratulations ${ownerName}!</h2>
        <p style="color: #666;">Your vehicle has been verified and approved.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">&#10003;</div>
          <h3 style="color: #28a745; margin: 0;">${vehicleName}</h3>
          <p style="color: #666; margin-top: 10px;">Now available for bookings</p>
        </div>
        
        <p style="color: #666;">Your vehicle is now live on Rush and can be booked by renters. Make sure your availability calendar is up to date!</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const text = `Congratulations ${ownerName}!\n\nYour vehicle ${vehicleName} has been verified and approved. It's now live on Rush and available for bookings.\n\nMake sure your availability calendar is up to date!\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: ownerEmail, subject, text, html });
}

export async function sendVehicleVerificationRejectedEmail(
  ownerEmail: string,
  ownerName: string,
  vehicleName: string,
  reason?: string
): Promise<boolean> {
  const subject = `Vehicle Verification Update - ${vehicleName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Verification Update</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${ownerName},</h2>
        <p style="color: #666;">We were unable to approve your vehicle at this time.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #dc3545; margin-top: 0;">${vehicleName}</h3>
          ${reason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p style="color: #666;">Please review the feedback and update your vehicle listing. You can resubmit for verification through the Rush app.</p>
        <p style="color: #666;">If you have questions, please contact our support team at ${RUSH_CONFIG.supportEmail}.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const text = `Hi ${ownerName},\n\nWe were unable to approve your vehicle ${vehicleName} at this time.\n\n${reason ? `Reason: ${reason}\n\n` : ''}Please review the feedback and update your vehicle listing. You can resubmit for verification through the Rush app.\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: ownerEmail, subject, text, html });
}

export async function sendTripCompletedEmail(
  renterEmail: string,
  renterName: string,
  vehicleName: string,
  ownerName: string
): Promise<boolean> {
  const subject = `Trip Completed - Rate Your Experience`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Thanks for riding with us!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${renterName},</h2>
        <p style="color: #666;">Your trip with ${vehicleName} has been completed.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #FF6B35; margin-top: 0;">How was your trip?</h3>
          <p style="color: #666;">Let ${ownerName} know how your experience was by leaving a review in the Rush app.</p>
        </div>
        
        <p style="color: #666;">Your feedback helps other renters make informed decisions and helps vehicle owners improve their service.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const text = `Hi ${renterName},\n\nYour trip with ${vehicleName} has been completed.\n\nWe'd love to hear about your experience! Leave a review in the Rush app to help ${ownerName} and other renters.\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: renterEmail, subject, text, html });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string,
  resetCode?: string
): Promise<boolean> {
  const subject = `Reset Your Password - ${RUSH_CONFIG.appName}`;
  
  const codeSection = resetCode ? `
        <p style="color: #666; margin-top: 20px;">Or enter this code in the ${RUSH_CONFIG.appName} app:</p>
        <div style="text-align: center; margin: 15px 0;">
          <div style="background: #fff; border: 2px dashed #FF6B35; padding: 16px 24px; border-radius: 8px; display: inline-block;">
            <code style="font-size: 14px; font-weight: 700; color: #333; letter-spacing: 1px; word-break: break-all;">${resetCode}</code>
          </div>
        </div>
  ` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #666;">We received a request to reset your password. Click the button below to create a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #FF6B35; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Your Password</a>
        </div>
        ${codeSection}
        <p style="color: #666; font-size: 14px;">This code and link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  
  const codeText = resetCode ? `\n\nOr enter this code in the app: ${resetCode}` : '';
  const text = `Hi ${name},\n\nWe received a request to reset your password. Visit the following link to create a new password:\n\n${resetLink}${codeText}\n\nThis code and link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.\n\nSupport: ${RUSH_CONFIG.supportEmail}\n\n- ${RUSH_CONFIG.appName} Team`;
  
  return sendEmail({ to: email, subject, text, html });
}
