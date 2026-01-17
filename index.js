/**
 * Meson Obfuscator - Discord Bot
 * Main entry point
 */

require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    REST, 
    Routes,
    Events,
    AttachmentBuilder 
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Express untuk keep-alive (Render free tier)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        bot: 'Meson Obfuscator',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`[WEB] Server running on port ${PORT}`);
});

// Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Command Collection
client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, 'commands');

// Check if commands folder exists
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const commands = [];
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`[CMD] Loaded: ${command.data.name}`);
        }
    }

    // Register Slash Commands
    if (process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID) {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        (async () => {
            try {
                console.log('[BOT] Registering slash commands...');
                
                await rest.put(
                    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                    { body: commands }
                );
                
                console.log('[BOT] Slash commands registered!');
            } catch (error) {
                console.error('[BOT] Error registering commands:', error);
            }
        })();
    }
} else {
    console.log('[WARN] Commands folder not found, creating...');
    fs.mkdirSync(commandsPath, { recursive: true });
}

// Bot Ready
client.once(Events.ClientReady, (c) => {
    console.log(`[BOT] Logged in as ${c.user.tag}`);
    console.log(`[BOT] Serving ${c.guilds.cache.size} servers`);
    
    client.user.setActivity('Lua code | /obfuscate', { type: 3 });
});

// Handle Slash Commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[ERROR] Command ${interaction.commandName}:`, error);
        
        const errorMsg = { 
            content: '❌ An error occurred while executing this command!', 
            ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

// Handle Message-based obfuscation
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    // Simple ping response for testing
    if (message.content === '!ping') {
        return message.reply('🏓 Pong! Bot is online.');
    }
    
    // Obfuscate command with attachment
    if (message.content.toLowerCase().startsWith('!obfuscate') || 
        message.content.toLowerCase().startsWith('m!obfuscate')) {
        
        const attachment = message.attachments.first();
        
        if (!attachment) {
            return message.reply('❌ Please attach a `.lua` file to obfuscate!\n\nUsage: `!obfuscate` with a .lua file attached');
        }
        
        if (!attachment.name.endsWith('.lua')) {
            return message.reply('❌ Only `.lua` files are supported!');
        }
        
        try {
            // Download file
            const response = await fetch(attachment.url);
            const luaCode = await response.text();
            
            // Size check
            if (luaCode.length > 500000) {
                return message.reply('❌ File too large! Maximum 500KB.');
            }
            
            const processingMsg = await message.reply('⏳ Obfuscating your code...');
            
            // Simple obfuscation for now (placeholder)
            const LuaObfuscator = require('./utils/luaRunner');
            const result = await LuaObfuscator.obfuscate(luaCode, {
                tier: 'basic',
                renameVariables: true,
                encryptStrings: true
            });
            
            if (result.success) {
                const outputBuffer = Buffer.from(result.code, 'utf-8');
                const outputFile = new AttachmentBuilder(outputBuffer, { 
                    name: `obfuscated_${attachment.name}` 
                });
                
                await processingMsg.edit({
                    content: `✅ **Obfuscation Complete!**\n` +
                             `📊 Original: ${luaCode.length} chars → Obfuscated: ${result.code.length} chars\n` +
                             `⏱️ Time: ${result.time}ms`,
                    files: [outputFile]
                });
            } else {
                await processingMsg.edit(`❌ **Obfuscation Failed!**\n\`\`\`\n${result.error}\n\`\`\``);
            }
            
        } catch (error) {
            console.error('[ERROR] Message obfuscate:', error);
            message.reply('❌ An error occurred: ' + error.message);
        }
    }
});

// Login
if (process.env.DISCORD_TOKEN) {
    client.login(process.env.DISCORD_TOKEN);
} else {
    console.log('[WARN] No DISCORD_TOKEN found. Bot will not connect to Discord.');
    console.log('[INFO] Web server is still running for health checks.');
}
