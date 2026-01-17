/**
 * Meson Obfuscator - Lua Obfuscator
 * Fixed version with proper Lua syntax handling
 */

class LuaObfuscator {
    constructor() {
        this.varCounter = 0;
        this.stringKey = 0;
    }

    /**
     * Generate random variable name
     */
    generateVarName() {
        const prefixes = ['_', 'l', 'I', 'O', 'v', 'x'];
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        for (let i = 0; i < 6; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        
        this.varCounter++;
        return name + this.varCounter;
    }

    /**
     * Encode string to byte array for Lua
     */
    encodeString(str, key) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            // XOR each character with key
            bytes.push(str.charCodeAt(i) ^ key);
        }
        return bytes;
    }

    /**
     * Generate the decoder function for Lua
     */
    generateDecoder(key) {
        const funcName = this.generateVarName();
        // Use bit library for Roblox Lua (bit32 atau bit.bxor)
        const decoder = `local ${funcName}=(function(k) return function(e) local r="" for i=1,#e do r=r..string.char(bit32 and bit32.bxor(e[i],k) or e[i]) end return r end end)(${key})`;
        return { name: funcName, code: decoder };
    }

    /**
     * Check if string should be encrypted
     */
    shouldEncryptString(str) {
        // Skip short strings, empty strings, or special patterns
        if (str.length < 4) return false;
        if (str.includes('\\')) return false;  // Has escape sequences
        if (/^[%w%s%p]+$/.test(str)) return false;  // Lua patterns
        return true;
    }

    /**
     * Collect all strings from code
     */
    collectStrings(code) {
        const strings = [];
        const regex = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        let match;
        
        while ((match = regex.exec(code)) !== null) {
            const fullMatch = match[0];
            const quote = fullMatch[0];
            const content = fullMatch.slice(1, -1);
            
            if (this.shouldEncryptString(content)) {
                strings.push({
                    original: fullMatch,
                    content: content,
                    quote: quote,
                    index: match.index
                });
            }
        }
        
        return strings;
    }

    /**
     * Encrypt strings in the code
     */
    encryptStrings(code, decoderName, key) {
        const strings = this.collectStrings(code);
        let result = code;
        let offset = 0;
        
        for (const str of strings) {
            const encoded = this.encodeString(str.content, key);
            const replacement = `${decoderName}({${encoded.join(",")}})`;
            
            const before = result.substring(0, str.index + offset);
            const after = result.substring(str.index + offset + str.original.length);
            
            result = before + replacement + after;
            offset += replacement.length - str.original.length;
        }
        
        return result;
    }

    /**
     * Rename local variables safely
     */
    renameVariables(code) {
        const renames = new Map();
        const luaKeywords = [
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
            'return', 'then', 'true', 'until', 'while', 'continue'
        ];
        const globals = [
            'game', 'workspace', 'script', 'print', 'warn', 'error', 'pcall',
            'xpcall', 'require', 'loadstring', 'getfenv', 'setfenv', 'getgenv',
            'getrenv', 'getrawmetatable', 'setrawmetatable', 'hookfunction',
            'newcclosure', 'task', 'wait', 'spawn', 'delay', 'tick', 'time',
            'typeof', 'type', 'pairs', 'ipairs', 'next', 'select', 'unpack',
            'tostring', 'tonumber', 'string', 'table', 'math', 'bit32', 'bit',
            'coroutine', 'debug', 'os', 'utf8', 'self', '_G', '_VERSION',
            'rawget', 'rawset', 'rawequal', 'assert', 'collectgarbage',
            'Vector3', 'Vector2', 'CFrame', 'Color3', 'BrickColor', 'UDim2',
            'UDim', 'Enum', 'Instance', 'Ray', 'Region3', 'TweenInfo'
        ];
        const skipList = [...luaKeywords, ...globals];
        
        // Find all local variable declarations
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!skipList.includes(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateVarName());
            }
        }
        
        // Find function parameter names
        const funcPattern = /function\s*[a-zA-Z0-9_.:]*\s*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            for (const param of params) {
                const cleanParam = param.replace(/\.\.\./g, '').trim();
                if (cleanParam && !skipList.includes(cleanParam) && !renames.has(cleanParam)) {
                    renames.set(cleanParam, this.generateVarName());
                }
            }
        }
        
        // Apply renames (careful not to rename partial matches)
        let result = code;
        renames.forEach((newName, oldName) => {
            // Use word boundary to avoid partial replacements
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });
        
        return result;
    }

    /**
     * Add junk/dead code
     */
    addJunkCode() {
        const junks = [];
        const junkCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < junkCount; i++) {
            const v = this.generateVarName();
            const val = Math.floor(Math.random() * 10000);
            junks.push(`local ${v}=${val}`);
        }
        
        return junks.join(';') + ';';
    }

    /**
     * Safe minification that preserves Lua syntax
     */
    safeMinify(code) {
        let result = code;
        
        // Remove block comments --[[ ]]
        result = result.replace(/--\[\[[\s\S]*?\]\]/g, '');
        
        // Remove single line comments (but not inside strings)
        // Simple approach: only remove comments at start of line or after whitespace
        result = result.replace(/(\s)--[^\n]*/g, '$1');
        result = result.replace(/^--[^\n]*/gm, '');
        
        // Remove multiple empty lines
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Trim each line
        result = result.split('\n').map(line => line.trim()).join('\n');
        
        // Remove empty lines
        result = result.split('\n').filter(line => line.length > 0).join('\n');
        
        // Collapse into single line with semicolons as separators
        result = result.replace(/\n/g, ' ');
        
        // Collapse multiple spaces into one
        result = result.replace(/\s+/g, ' ');
        
        // Remove spaces around specific operators (carefully)
        result = result.replace(/\s*([{}(),\[\];])\s*/g, '$1');
        
        // But preserve spaces around = (because of ==, ~=, >=, <=)
        // And preserve spaces after keywords
        
        return result.trim();
    }

    /**
     * Main obfuscation function
     */
    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        
        try {
            // Reset state
            this.varCounter = 0;
            this.stringKey = Math.floor(Math.random() * 200) + 50;  // Random key 50-250
            
            let output = sourceCode;
            const tier = options.tier || 'basic';
            
            // Step 1: Add decoder and encrypt strings (all tiers)
            const decoder = this.generateDecoder(this.stringKey);
            output = this.encryptStrings(output, decoder.name, this.stringKey);
            output = decoder.code + '\n' + output;
            
            // Step 2: Rename variables (standard and advanced)
            if (tier === 'standard' || tier === 'advanced') {
                output = this.renameVariables(output);
            }
            
            // Step 3: Add junk code (advanced only)
            if (tier === 'advanced') {
                output = this.addJunkCode() + '\n' + output;
            }
            
            // Step 4: Minify (optional, but safe)
            output = this.safeMinify(output);
            
            // Validate output isn't empty
            if (!output || output.length < 10) {
                throw new Error('Obfuscation produced empty output');
            }
            
            return {
                success: true,
                code: output,
                time: Date.now() - startTime
            };
            
        } catch (error) {
            return {
                success: false,
                code: '',
                error: error.message,
                time: Date.now() - startTime
            };
        }
    }
}

module.exports = new LuaObfuscator();
