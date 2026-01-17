const { 
    SlashCommandBuilder, 
    AttachmentBuilder 
} = require('discord.js');
const path = require('path');

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
                    { name: '🟢 Basic', value: 'basic' },
                    { name: '🟡 Standard', value: 'standard' },
                    { name: '🔴 Advanced', value: 'advanced' }
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

            // Memanggil luaRunner.js dari folder utils
            const LuaObfuscator = require('../utils/luaRunner');
            const result = await LuaObfuscator.obfuscate(luaCode, { tier });

            if (result.success) {
                const stats = [
                    `📁 **File:** \`${fileName}\``,
                    `📊 **Size:** ${luaCode.length} → ${result.code.length} chars`,
                    `⏱️ **Time:** ${result.time}ms`,
                    `🎚️ **Tier:** ${tier.toUpperCase()}`,
                ].join('\n');

                if (result.code.length < 1900) {
                    return interaction.editReply({
                        content: `✅ **Obfuscation Complete!**\n${stats}\n\n\`\`\`lua\n${result.code}\n\`\`\``
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
