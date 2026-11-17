const nodemailer = require('nodemailer');

const emailKeys = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'ADMIN_EMAIL'];

const getTransporter = () => {
  const configured = emailKeys.filter((key) => process.env[key]);
  if (configured.length === 0) return null;
  const missing = emailKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email delivery is partially configured; set or clear: ${missing.join(', ')}.`);
  }

  const port = Number(process.env.EMAIL_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('EMAIL_PORT must be a valid TCP port.');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const sendNotification = async ({ subject, title, rows }) => {
  const transporter = getTransporter();
  if (!transporter) return;
  const htmlRows = rows.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || 'N/A')}</p>`).join('');
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: `<h2>${escapeHtml(title)}</h2>${htmlRows}<hr/><p>Review and manage this request in the admin dashboard.</p>`,
  });
};

const sendQuotationEmail = async (enquiry) => {
  const transporter = getTransporter();
  if (!transporter) return false;
  const htmlRows = [
    ['Reference', enquiry.referenceId],
    ['Quotation', `${enquiry.quotationCurrency} ${enquiry.quotationAmount}`],
    ['Design', enquiry.designName || enquiry.productSelection],
    ['Quantity', enquiry.quantity],
    ['Notes', enquiry.adminNotes],
  ].map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || 'N/A')}</p>`).join('');
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: enquiry.email,
    subject: `Quotation ${enquiry.referenceId}`,
    html: `<h2>Your quotation from Shreeji Impex</h2>${htmlRows}<p>Please reply to this email if you have any questions.</p>`,
  });
  return true;
};

const sendEnquiryNotification = async (enquiry) => {
  try {
    await sendNotification({
      subject: `New enquiry: ${enquiry.referenceId}`,
      title: 'New quotation enquiry received',
      rows: [
        ['Reference', enquiry.referenceId],
        ['Name', enquiry.fullName],
        ['Company', enquiry.companyName],
        ['Country', enquiry.country],
        ['Email', enquiry.email],
        ['WhatsApp', enquiry.whatsapp],
        ['Quantity', enquiry.quantity],
        ['Message', enquiry.additionalMessage],
      ],
    });
  } catch (error) {
    console.error(`Enquiry notification email failed: ${error.message}`);
  }
};

const sendCustomRequestNotification = async (request) => {
  try {
    await sendNotification({
      subject: `New custom design request: ${request.fullName}`,
      title: 'New custom design request',
      rows: [
        ['Name', request.fullName],
        ['Company', request.companyName],
        ['Country', request.country],
        ['Email', request.email],
        ['Quantity', request.requiredQuantity],
        ['Colors', request.preferredColors],
        ['Instructions', request.additionalInstructions],
      ],
    });
  } catch (error) {
    console.error(`Custom request notification email failed: ${error.message}`);
  }
};

module.exports = { sendEnquiryNotification, sendCustomRequestNotification, sendQuotationEmail };
