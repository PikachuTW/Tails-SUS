const Discord = require('discord.js');

async function clean(client, text) {
    let value = text;
    if (value && value.constructor.name === 'Promise') { value = await value; }
    if (typeof value !== 'string') { value = require('util').inspect(value, { depth: 3 }); }

    value = value
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`);

    value = value.replaceAll(client.token, '[REDACTED]');

    return value;
}

module.exports = async (client, message) => {
    if (message.author.bot || !message.channelId || !message.channel.permissionsFor(message.guild.me)?.has(['MANAGE_WEBHOOKS', 'SEND_MESSAGES', 'MANAGE_MESSAGES']) || ['GUILD_TEXT', 'GUILD_NEWS'].indexOf(message.channel.type) === -1 || message.webookId || !message.content.toLowerCase().startsWith('s?')) return;
    if (message.member.id === '1030154567775686838') return;
    message.delete();
    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (['s?s', 's?say'].indexOf(command) != -1) {
        if (!args[0]) return;
        let name, avatar;
        const targetArr = args[0].matchAll(Discord.MessageMentions.USERS_PATTERN).next().value;
        if (targetArr) {
            target = message.guild.members.cache.get(targetArr[1]);
            if (target) {
                name = target.nickname || target.user.username;
                avatar = target.displayAvatarURL();
            }
        } else {
            target = message.guild.members.cache.get(args[0]);
            if (target) {
                name = target.nickname || target.user.username;
                avatar = target.displayAvatarURL();
            } else {
                try {
                    target = await client.users.fetch(args[0]);
                } catch { }
                if (target) {
                    name = target.username;
                    avatar = target.displayAvatarURL();
                }
            }
        }
        if (!name) name = args[0];
        const fakeContent = args.slice(1).join(' ');
        const att = message.attachments;
        if (!fakeContent && att.size === 0) return;
        const webhooks = await message.channel.fetchWebhooks();
        let webhook = webhooks.find(d => d.name === 'Tails SUS');
        if (!webhook) {
            if (webhooks.size >= 10) return message.channel.send('此頻道的Webhooks已經超過10個，請刪除一些我才能創建');
            webhook = await message.channel.createWebhook('Tails SUS');
        }
        if (!avatar) {
            await webhook.send({
                content: fakeContent ? fakeContent : null,
                username: name,
                files: att.size > 0 ? att.map(a => a) : null,
            });
        } else {
            await webhook.send({
                content: fakeContent ? fakeContent : null,
                username: name,
                avatarURL: avatar,
                files: att.size > 0 ? att.map(a => a) : null,
            });
        }
    }
    else if (command === 's?ping') {
        message.channel.send(`機器人延遲: \`${Date.now() - message.createdTimestamp}\` ms\nApi延遲: \`${client.ws.ping}\` ms`);
    }
    else if (command === 's?help') {
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                    .setTitle('**幫助頁面**')
                    .setColor(0xffae00)
                    .addFields([
                        { name: 's?say [@用戶] [訊息]', value: '模仿任何人說話' },
                        { name: 's?invite', value: '邀請我到你的伺服器' },
                    ])
                    .setFooter({ text: 'Tails SUS | Made By Tails', iconURL: 'https://i.imgur.com/z7hotb4.jpg' }),
            ],
        });
    }
    else if (command === 's?invite') {
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                    .setTitle('**邀請我**')
                    .setColor(0xffae00)
                    .setDescription('[邀請我到你的伺服器](https://discord.com/api/oauth2/authorize?client_id=890973929630478437&permissions=8&scope=bot)\n\n[機器人支援伺服器](https://discord.gg/HswZaneNjQ)')
                    .setFooter({ text: 'Tails SUS | Made By Tails', iconURL: 'https://i.imgur.com/z7hotb4.jpg' }),
            ],
        });
    } else if (command === 's?shutdown') {
        if (message.author.id === '650604337000742934') {
            message.channel.send('機器人已關閉');
            process.exit(0);
        }
    } else if (command === 's?eval') {
        if (message.author.id === '650604337000742934') {
            const code = args.join(' ');
            try {
                const evaled = eval(code);
                const cleaned = await clean(client, evaled);
                if (cleaned.startsWith('<ref *1>')) return;
                console.log(`${cleaned}`);
            } catch (err) {
                console.log(`${err}`);
            }
        }
    }
};