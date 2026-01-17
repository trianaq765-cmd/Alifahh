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
                    value: 'Send `!obfuscate` or `m!obfuscate` with a `.lua` file attached'
                },
                {
                    name: '🎚️ Obfuscation Tiers',
                    value: [
                        '**🟢 Basic** - Variable renaming, String encryption',
                        '**🟡 Standard** - Basic + Control flow flattening',
                        '**🔴 Advanced** - All features + Dead code + Opaque predicates'
                    ].join('\n')
                },
                {
                    name: '📊 Features',
                    value: [
                        '✓ Variable Renaming',
                        '✓ String Encryption (XOR/Base64)',
                        '✓ Number Encoding',
                        '✓ Control Flow Flattening',
                        '✓ Dead Code Injection',
                        '✓ Opaque Predicates',
                        '✓ Minification'
                    ].join('\n')
                },
                {
                    name: '⚠️ Limits',
                    value: 'Maximum file size: 500KB'
                }
            )
            .setFooter({ text: 'Meson Obfuscator v1.0.0 | Roblox Lua 2025' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
