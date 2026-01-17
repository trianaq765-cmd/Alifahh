const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information for Meson Obfuscator'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🔐 Meson Obfuscator - Help')
            .setDescription('A powerful Lua obfuscator for Roblox scripts')
            .addFields(
                {
                    name: '📌 Commands',
                    value: [
                        '`/obfuscate` - Obfuscate Lua code',
                        '`/help` - Show this help message',
                        '`/stats` - Show bot statistics',
                    ].join('\n')
                },
                {
                    name: '📎 Message Command',
                    value: 'Send `!obfuscate` with a `.lua` file attached'
                },
                {
                    name: '🎚️ Obfuscation Tiers',
                    value: [
                        '**🟢 Basic** - Variable renaming, String encryption',
                        '**🟡 Standard** - Basic + Control flow flattening',
                        '**🔴 Advanced** - All features + Dead code'
                    ].join('\n')
                }
            )
            .setFooter({ text: 'Meson Obfuscator v1.0.0' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
