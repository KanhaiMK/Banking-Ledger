const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,  // force IPv4
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
    console.error('Error connecting to email server:', error);
    } else {
    console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
    const info = await transporter.sendMail({
      from: `"MK_Bank" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
    console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = "🎉 Welcome to MK_Bank!";
    const text = `
Hello ${name},

Welcome to MK_Bank!

Thank you for creating an account with us. We're excited to have you join our community.

MK_Bank is designed to help you manage and track your financial records efficiently. We hope you enjoy using our platform.

If you have any questions or need assistance, feel free to contact our support team. We're always here to help.

Thank you for choosing MK_Bank.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to MK_Bank! 🎉</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>
                Thank you for creating an account with <strong>MK_Bank</strong>.
                We're excited to have you join our community.
            </p>

            <p>
                MK_Bank is designed to help you manage and track your financial records efficiently.
                We hope you enjoy using our platform.
            </p>

            <p>
                If you have any questions or need assistance, feel free to contact our support team.
                We're always here to help.
            </p>

            <p>Thank you for choosing MK_Bank.</p>

            <br>

            <p>
                Best regards,<br>
                <strong>The MK_Bank Team</strong>
            </p>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = "💸 Amount Debited Successfully";

    const text = `
Hello ${name},

We would like to inform you that an amount of ₹${amount} has been successfully debited from your account and transferred to ${toAccount}.

Transaction Details:
--------------------------------
Amount Debited : ₹${amount}
Transferred To : ${toAccount}
Status : Successful
--------------------------------

Thank you for banking with MK_Bank.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">
                💸 Amount Debited Successfully
            </h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>
                We would like to inform you that an amount of
                <strong style="color: #dc2626;">₹${amount}</strong>
                has been successfully debited from your account.
            </p>

            <div style="
                background-color: #ffffff;
                border-left: 5px solid #dc2626;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-top: 0; color: #dc2626;">
                    Transaction Details
                </h3>

                <p><strong>Amount Debited:</strong> ₹${amount}</p>
                <p><strong>Transferred To:</strong> ${toAccount}</p>
                <p>
                    <strong>Status:</strong>
                    <span style="color: #16a34a;">Successful ✅</span>
                </p>
            </div>

            <p>
                Thank you for banking with <strong>MK_Bank</strong>.
            </p>

            <br>

            <p>
                Best regards,<br>
                <strong>The MK_Bank Team</strong>
            </p>
        </div>

        <div style="
            text-align: center;
            color: #888;
            font-size: 12px;
            padding: 15px;
        ">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmailtoAccount(userEmail, name, amount, fromAccount) {
    const subject = "💰 Amount Credited Successfully";

    const text = `
Hello ${name},

We are pleased to inform you that an amount of ₹${amount} has been successfully credited to your account from ${fromAccount}.

Transaction Details:
--------------------------------
Amount Credited : ₹${amount}
Received From : ${fromAccount}
Status : Successful
--------------------------------

Thank you for banking with MK_Bank.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">
                💰 Amount Credited Successfully
            </h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>
                We are pleased to inform you that an amount of
                <strong style="color: #16a34a;">₹${amount}</strong>
                has been successfully credited to your account.
            </p>

            <div style="
                background-color: #ffffff;
                border-left: 5px solid #16a34a;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-top: 0; color: #16a34a;">
                    Transaction Details
                </h3>

                <p><strong>Amount Credited:</strong> ₹${amount}</p>
                <p><strong>Received From:</strong> ${fromAccount}</p>
                <p>
                    <strong>Status:</strong>
                    <span style="color: #16a34a;">Successful ✅</span>
                </p>
            </div>

            <p>
                Thank you for banking with <strong>MK_Bank</strong>.
            </p>

            <br>

            <p>
                Best regards,<br>
                <strong>The MK_Bank Team</strong>
            </p>
        </div>

        <div style="
            text-align: center;
            color: #888;
            font-size: 12px;
            padding: 15px;
        ">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendFundRequestApprovedEmail(userEmail, name, amount, accountNo) {
    const subject = "✅ Fund Request Approved";

    const text = `
Hello ${name},

Great news! Your fund request of ₹${amount} has been approved and credited to your account.

Request Details:
--------------------------------
Account Number : ${accountNo}
Amount Credited : ₹${amount}
Status         : Approved ✅
--------------------------------

Thank you for banking with MK_Bank.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Fund Request Approved</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>
                Great news! Your fund request of
                <strong style="color: #16a34a;">₹${amount}</strong>
                has been approved and successfully credited to your account.
            </p>

            <div style="
                background-color: #ffffff;
                border-left: 5px solid #16a34a;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-top: 0; color: #16a34a;">Request Details</h3>
                <p><strong>Account Number:</strong> ${accountNo}</p>
                <p><strong>Amount Credited:</strong> ₹${amount}</p>
                <p><strong>Status:</strong> <span style="color: #16a34a;">Approved ✅</span></p>
            </div>

            <p>Thank you for banking with <strong>MK_Bank</strong>.</p>
            <br>
            <p>Best regards,<br><strong>The MK_Bank Team</strong></p>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendFundRequestRejectedEmail(userEmail, name, amount, accountNo) {
    const subject = "❌ Fund Request Rejected";

    const text = `
Hello ${name},

Unfortunately, your fund request of ₹${amount} for account ${accountNo} has been rejected by our system.

Request Details:
--------------------------------
Account Number   : ${accountNo}
Amount Requested : ₹${amount}
Status          : Rejected ❌
--------------------------------

If you believe this is a mistake, please submit a new request or contact support.

Thank you for banking with MK_Bank.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">❌ Fund Request Rejected</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>
                Unfortunately, your fund request of
                <strong style="color: #dc2626;">₹${amount}</strong>
                for account <strong>${accountNo}</strong> has been rejected by our system.
            </p>

            <div style="
                background-color: #ffffff;
                border-left: 5px solid #dc2626;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-top: 0; color: #dc2626;">Request Details</h3>
                <p><strong>Account Number:</strong> ${accountNo}</p>
                <p><strong>Amount Requested:</strong> ₹${amount}</p>
                <p><strong>Status:</strong> <span style="color: #dc2626;">Rejected ❌</span></p>
            </div>

            <p>If you believe this is a mistake, please submit a new request or contact support.</p>
            <br>
            <p>Best regards,<br><strong>The MK_Bank Team</strong></p>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendOTPEmail(userEmail, name, otp) {
    const subject = "🔐 Your Password Reset OTP";

    const text = `
Hello ${name},

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Password Reset OTP</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your OTP for password reset is:</p>

            <div style="
                text-align: center;
                font-size: 2.5rem;
                font-weight: 800;
                letter-spacing: 0.3em;
                color: #7c3aed;
                background: #ede9fe;
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
            ">${otp}</div>

            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br><strong>The MK_Bank Team</strong></p>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendAccountDeletionEmail(userEmail, name) {
    const subject = "🗑 Your Account Has Been Deleted";

    const text = `
Hello ${name},

Your MK_Bank account has been permanently deleted.

If you did not request this, please contact our support team immediately.

Best regards,
The MK_Bank Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🗑 Account Deleted</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
            <p>Hello <strong>${name}</strong>,</p>

            <p>Your <strong>MK_Bank</strong> account has been permanently deleted.</p>

            <p>All your data including accounts and transactions have been removed from our system.</p>

            <p>If you did not request this, please contact our support team immediately.</p>

            <br>
            <p>Best regards,<br><strong>The MK_Bank Team</strong></p>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">
            © ${new Date().getFullYear()} MK_Bank. All rights reserved.
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionEmailtoAccount,
    sendFundRequestApprovedEmail,
    sendFundRequestRejectedEmail,
    sendOTPEmail,
    sendAccountDeletionEmail
};