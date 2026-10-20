const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');

const PREFIX = '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  plugins: [new YouTubePlugin()],
  emitNewSongOnly: true,
});

client.once('ready', () => console.log(`Bot online: ${client.user.tag}`));

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.content.startsWith(PREFIX)) return;

  const [cmd, ...args] = msg.content.slice(PREFIX.length).trim().split(/\s+/);
  const vc = msg.member.voice.channel;
  const queue = distube.getQueue(msg.guild);

  try {
    switch (cmd.toLowerCase()) {
      case 'play':
      case 'p':
        if (!vc) return msg.reply('Hãy vào kênh voice trước đã!');
        if (!args.length) return msg.reply('Dùng: `!play tên bài hoặc link`');
        await distube.play(vc, args.join(' '), {
          textChannel: msg.channel,
          member: msg.member,
        });
        break;

      case 'skip':
        if (!queue) return msg.reply('Không có bài nào đang phát.');
        await distube.skip(msg.guild);
        msg.reply('⏭️ Đã bỏ qua.');
        break;

      case 'stop':
        if (!queue) return msg.reply('Không có
