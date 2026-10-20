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
                if (!queue) return msg.reply('Không có bài nào đang phát.');
        await distube.stop(msg.guild);
        msg.reply('Đã dừng và xóa hàng đợi.');
        break;

      case 'pause':
        if (!queue) return msg.reply('Không có bài nào đang phát.');
        distube.pause(msg.guild);
        msg.reply('Đã tạm dừng.');
        break;

      case 'resume':
        if (!queue) return msg.reply('Không có bài nào đang phát.');
        distube.resume(msg.guild);
        msg.reply('Tiếp tục phát.');
        break;

      case 'volume': {
        if (!queue) return msg.reply('Không có bài nào đang phát.');
        const v = parseInt(args[0]);
        if (isNaN(v) || v < 0 || v > 100) return msg.reply('Dùng: !volume 0-100');
        distube.setVolume(msg.guild, v);
        msg.reply('Âm lượng: ' + v + '%');
        break;
      }

      case 'queue':
      case 'q':
        if (!queue) return msg.reply('Hàng đợi trống.');
        msg.reply(
          queue.songs
            .slice(0, 10)
            .map((s, i) => (i === 0 ? '>' : i + '.') + ' ' + s.name + ' (' + s.formattedDuration + ')')
            .join('\n')
        );
        break;

      case 'leave':
        distube.voices.leave(msg.guild);
        msg.reply('Tạm biệt!');
        break;

      case 'help':
        msg.reply('Lệnh: !play, !skip, !stop, !pause, !resume, !volume, !queue, !leave');
        break;
    }
  } catch (err) {
    console.error(err);
    msg.reply('Có lỗi: ' + String(err.message || err).slice(0, 200));
  }
});

distube.on('playSong', (queue, song) => {
  queue.textChannel?.send('Đang phát: ' + song.name + ' (' + song.formattedDuration + ')');
});
distube.on('addSong', (queue, song) => {
  queue.textChannel?.send('Đã thêm: ' + song.name);
});
distube.on('error', (error, queue) => {
  console.error(error);
  queue?.textChannel?.send('Lỗi phát nhạc: ' + String(error.message).slice(0, 200));
});

if (!process.env.TOKEN) {
  console.error('Thiếu TOKEN');
  process.exit(1);
}
client.login(process.env.TOKEN);
                                     
