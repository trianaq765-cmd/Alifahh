const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show bot statistics'),

    async execute(interaction) {
        const client = interaction.client;
        
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        const memUsage = process.memoryUsage();
        const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('📊 Meson Obfuscator - Statistics')
            .addFields(
                { name: '🖥️ Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
                { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: uptimeStr, inline: true },
                { name: '💾 Memory', value: `${memMB} MB`, inline: true },
                { name: '📦 Node.js', value: process.version, inline: true }
            )
            .setFooter({ text: 'Meson Obfuscator' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
