const venom = require('venom-bot');
const config = require('./config');
const commands = require('./commands');

// Session පාලනය
const sessionConfig = {
  session: config.SESSION_ID,
  multidevice: config.MULTI_DEVICE,
  catchQR: (base64Qr) => {
    console.log('QR Code Generated!');
    // QR කේතය ගොනුවකට සුරකින්න (විකල්ප)
    require('fs').writeFileSync('qr-code.png', base64Qr.replace('data:image/png;base64,', ''), 'base64');
  }
};

venom.create(sessionConfig)
  .then((client) => {
    console.log(`✅ ${config.BOT_NAME} Activated!`);

    // පණිවිඩ හැසිරවීම
    client.onMessage(async (message) => {
      if (message.body.startsWith('!')) {
        const cmd = message.body.slice(1).toLowerCase();
        if (commands[cmd]) {
          await commands[cmd].execute(client, message);
        }
      }
    });

    // State Change Handling
    client.onStateChange((state) => {
      if (state === 'CONFLICT') client.forceRefocus();
    });

  })
  .catch((err) => {
    console.error('Bot Error:', err);
  });
