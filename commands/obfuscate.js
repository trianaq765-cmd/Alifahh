const { 
    SlashCommandBuilder, 
    AttachmentBuilder 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('obfuscate')
        .setDescription('Obfuscate Lua code')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Lua file to obfuscate')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Lua code to obfuscate (for small snippets)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Obfuscation tier')
                .setRequired(false)
                .addChoices(
                    { name: '🟢 Basic - String Encryption', value: 'basic' },
                    { name: '🟡 Standard - Strings + Variables + Numbers', value: 'standard' },
                    { name: '🔴 Advanced - All Features', value: 'advanced' },
                    { name: '💎 VM/Ultimate - Virtual Machine Protection', value: 'vm' }
                )),

    async execute(interaction) {
        const file = interaction.options.getAttachment('file');
        const codeSnippet = interaction.options.getString('code');
        const tier = interaction.options.getString('tier') || 'basic';

        if (!file && !codeSnippet) {
            return interaction.reply({
                content: '❌ Please provide either a file or code snippet!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            let luaCode;
            let fileName = 'snippet.lua';

            if (file) {
                if (!file.name.endsWith('.lua')) {
                    return interaction.editReply('❌ Only `.lua` files are supported!');
                }
                const response = await fetch(file.url);
                luaCode = await response.text();
                fileName = file.name;
            } else {
                luaCode = codeSnippet;
            }

            const LuaObfuscator = require('../utils/luaRunner');
            const result = await LuaObfuscator.obfuscate(luaCode, { tier });

            if (result.success) {
                const tierNames = {
                    basic: '🟢 Basic',
                    standard: '🟡 Standard',
                    advanced: '🔴 Advanced',
                    vm: '💎 VM/Ultimate'
                };

                const stats = [
                    `📁 **File:** \`${fileName}\``,
                    `📊 **Size:** ${luaCode.length} → ${result.code.length} chars`,
                    `📈 **Ratio:** ${((result.code.length / luaCode.length) * 100).toFixed(1)}%`,
                    `⏱️ **Time:** ${result.time}ms`,
                    `🎚️ **Tier:** ${tierNames[tier] || tier}`,
                ].join('\n');

                if (result.code.length < 1900) {
                    return interaction.editReply({
                        content: `✅ **Obfuscation Complete!**\n${stats}\n\n\`\`\`lua\n${result.code.substring(0, 1800)}\n\`\`\``
                    });
                }

                const outputBuffer = Buffer.from(result.code, 'utf-8');
                const outputFile = new AttachmentBuilder(outputBuffer, { 
                    name: `obfuscated_${fileName}` 
                });

                return interaction.editReply({
                    content: `✅ **Obfuscation Complete!**\n${stats}`,
                    files: [outputFile]
                });
            } else {
                return interaction.editReply({
                    content: `❌ **Obfuscation Failed!**\n\`\`\`\n${result.error}\n\`\`\``
                });
            }

        } catch (error) {
            console.error('[ERROR] Obfuscate command:', error);
            return interaction.editReply({
                content: '❌ Error: ' + error.message
            });
        }
    }
};
