const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');

const PREFIX = '!';
const NO_SONG = 'Khong co bai nao dang phat.';

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

client.once('ready', () => console.log('Bot online: ' + client.user.tag));

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.content.startsWith(PREFIX)) return;

  const parts = msg.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = parts.shift().toLowerCase();
  const args = parts;
  const vc = msg.member.voice.channel;
  const queue = distube.getQueue(msg.guild);

  try {
    if (cmd === 'play' || cmd === 'p') {
      if (!vc) return msg.reply('Hay vao kenh voice truoc da!');
      if (!args.length) return msg.reply('Dung: !play ten bai hoac link');
      await distube.play(vc, args.join(' '), {
        textChannel: msg.channel,
        member: msg.member,
      });
    } else if (cmd === 'skip') {
      if (!queue) return msg.reply(NO_SONG);
      await distube.skip(msg.guild);
      msg.reply('Da bo qua.');
    } else if (cmd === 'stop') {
      if (!queue) return msg.reply(NO_SONG);
      await distube.stop(msg.guild);
      msg.reply('Da dung va xoa hang doi.');
    } else if (cmd === 'pause') {
      if (!queue) return msg.reply(NO_SONG);
      distube.pause(msg.guild);
      msg.reply('Da tam dung.');
    } else if (cmd === 'resume') {
      if (!queue) return msg.reply(NO_SONG);
      distube.resume(msg.guild);
      msg.reply('Tiep tuc phat.');
    } else if (cmd === 'volume') {
      if (!queue) return msg.reply(NO_SONG);
      const v = parseInt(args[0]);
      if (isNaN(v) || v < 0 || v > 100) return msg.reply('Dung: !volume 0-100');
      distube.setVolume(msg.guild, v);
      msg.reply('Am luong: ' + v + '%');
    } else if (cmd === 'queue' || cmd === 'q') {
      if (!queue) return msg.reply('Hang doi trong.');
      const list = queue.songs
        .slice(0, 10)
        .map((s, i) => (i === 0 ? '>' : i + '.') + ' ' + s.name + ' (' + s.formattedDuration + ')')
        .join('\n');
      msg.reply(list);
    } else if (cmd === 'leave') {
      distube.voices.leave(msg.guild);
      msg.reply('Tam biet!');
    } else if (cmd === 'help') {
      msg.reply('Lenh: !play, !skip, !stop, !pause, !resume, !volume, !queue, !leave');
    }
  } catch (err) {
    console.error(err);
    msg.reply('Co loi: ' + String(err.message || err).slice(0, 200));
  }
});

distube.on('playSong', (queue, song) => {
  queue.textChannel?.send('Dang phat: ' + song.name + ' (' + song.formattedDuration + ')');
});
distube.on('addSong', (queue, song) => {
  queue.textChannel?.send('Da them: ' + song.name);
});
distube.on('error', (error, queue) => {
  console.error(error);
  queue?.textChannel?.send('Loi phat nhac: ' + String(error.message).slice(0, 200));
});

if (!process.env.TOKEN) {
  console.error('Thieu TOKEN');
  process.exit(1);
}
client.login(process.env.TOKEN);
