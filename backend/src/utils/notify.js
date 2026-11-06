const prisma = require('../prismaClient');
const { sendMail } = require('./mailer');
const config = require('../config');

// Creates an in-app notification and, if the user allows it, emails them too.
async function notify(userId, { type = 'info', title, message, link, email = false }) {
  if (!userId) return null;
  const n = await prisma.notification.create({ data: { userId, type, title, message, link: link || null } });
  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, notifyEmail: true } });
    if (user?.notifyEmail) {
      const url = link ? `${config.appUrl}${link}` : config.appUrl;
      sendMail({ to: user.email, subject: `LifeStream: ${title}`, text: `${message}\n\n${url}` }).catch(() => {});
    }
  }
  return n;
}

async function notifyAdmins(payload) {
  const admins = await prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } });
  await Promise.all(admins.map((a) => notify(a.id, payload)));
}

module.exports = { notify, notifyAdmins };
