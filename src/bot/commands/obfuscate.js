/**
 * /obfuscate command
 * Obfuscate Lua code via Discord
 */

const { 
    SlashCommandBuilder, 
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const LuaRunner = require('../utils/luaRunner');

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
                    { name: '🟢 Basic - Variable Rename + String Encrypt', value: 'basic' },
                    { name: '🟡 Standard - Basic + Control Flow', value: 'standard' },
                    { name: '🔴 Advanced - All Features', value: 'advanced' }
                ))
        .addBooleanOption(option =>
            option.setName('minify')
                .setDescription('Minify the output')
                .setRequired(false)),

    async execute(interaction) {
        const file = interaction.options.getAttachment('file');
        const codeSnippet = interaction.options.getString('code');
        const tier = interaction.options.getString('tier') || 'basic';
        const minify = interaction.options.getBoolean('minify') ?? true;

        // Validate input
        if (!file && !codeSnippet) {
            return interaction.reply({
                content: '❌ Please provide either a file attachment or code snippet!\n\n' +
                         '**Usage:**\n' +
                         '• `/obfuscate file:<attach .lua file>`\n' +
                         '• `/obfuscate code:<your lua code>`\n' +
                         '• Or send `!obfuscate` with a .lua file attached',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            let luaCode;
            let fileName = 'snippet.lua';

            if (file) {
                // Validate file
                if (!file.name.endsWith('.lua')) {
                    return interaction.editReply('❌ Only `.lua` files are supported!');
                }
                
                if (file.size > 500000) {
                    return interaction.editReply('❌ File too large! Maximum 500KB.');
                }

                // Download file
                const response = await fetch(file.url);
                luaCode = await response.text();
                fileName = file.name;
            } else {
                luaCode = codeSnippet;
            }

            // Obfuscate
            const startTime = Date.now();
            const result = await LuaRunner.obfuscate(luaCode, {
                tier: tier,
                minify: minify,
                renameVariables: true,
                encryptStrings: true,
                encryptNumbers: tier !== 'basic',
                controlFlow: tier === 'standard' || tier === 'advanced',
                deadCode: tier === 'advanced',
                opaquePredicates: tier === 'advanced'
            });
            const endTime = Date.now();

            if (result.success) {
                const stats = [
                    `📁 **File:** \`${fileName}\``,
                    `📊 **Size:** ${luaCode.length} → ${result.code.length} chars`,
                    `📈 **Ratio:** ${((result.code.length / luaCode.length) * 100).toFixed(1)}%`,
                    `⏱️ **Time:** ${endTime - startTime}ms`,
                    `🎚️ **Tier:** ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
                ].join('\n');

                // If output is small, show in code block
                if (result.code.length < 1900) {
                    return interaction.editReply({
                        content: `✅ **Obfuscation Complete!**\n${stats}\n\n\`\`\`lua\n${result.code}\n\`\`\``
                    });
                }

                // Otherwise, send as file
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
                    content: `❌ **Obfuscation Failed!**\n\`\`\`\n${result.error}\n\`\`\`\n` +
                             `💡 Make sure your Lua code has valid syntax.`
                });
            }

        } catch (error) {
            console.error('[ERROR] Obfuscate command:', error);
            return interaction.editReply({
                content: '❌ An unexpected error occurred!\n```\n' + error.message + '\n```'
            });
        }
    }
};
