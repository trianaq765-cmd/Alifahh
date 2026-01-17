/**
 * Meson Obfuscator v2.0 - Advanced Lua Obfuscator
 * Supports: String Encryption, Number Encoding, Control Flow, Dead Code, Opaque Predicates
 */

const StringEncrypt = require('./transforms/stringEncrypt');
const NumberEncode = require('./transforms/numberEncode');
const ControlFlow = require('./transforms/controlFlow');
const DeadCode = require('./transforms/deadCode');
const OpaquePredicates = require('./transforms/opaquePredicates');

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.varCounter = 0;
        this.funcCounter = 0;
        this.labelCounter = 0;
        this.usedNames = new Set();
    }

    /**
     * Generate unique obfuscated name
     */
    generateName(prefix = '_') {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const styles = [
            // Style 1: _0x format
            () => '_0x' + Math.random().toString(16).substr(2, 6),
            // Style 2: Il1 confusion
            () => {
                let name = '';
                for (let i = 0; i < 8; i++) {
                    name += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                return name;
            },
            // Style 3: Unicode-like
            () => '_' + 'v' + (this.varCounter++) + '_' + Math.random().toString(36).substr(2, 4),
            // Style 4: OoO0 confusion  
            () => {
                let name = '';
                for (let i = 0; i < 8; i++) {
                    name += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                return '_' + name;
            }
        ];

        let name;
        do {
            const style = styles[Math.floor(Math.random() * styles.length)];
            name = style();
        } while (this.usedNames.has(name));

        this.usedNames.add(name);
        return name;
    }

    /**
     * Lua keywords and globals to never rename
     */
    getProtectedNames() {
        return new Set([
            // Lua keywords
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or',
            'repeat', 'return', 'then', 'true', 'until', 'while', 'continue',
            
            // Lua globals
            'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs',
            'ipairs', 'next', 'select', 'unpack', 'pack', 'pcall', 'xpcall',
            'tonumber', 'tostring', 'rawget', 'rawset', 'rawequal', 'rawlen',
            'setmetatable', 'getmetatable', 'require', 'loadstring', 'load',
            'dofile', 'loadfile', 'collectgarbage', 'newproxy',
            
            // Lua libraries
            'string', 'table', 'math', 'bit32', 'bit', 'coroutine', 'debug',
            'os', 'io', 'utf8', 'package',
            
            // Roblox globals
            'game', 'workspace', 'script', 'plugin', 'shared', 'tick', 'time',
            'wait', 'Wait', 'delay', 'Delay', 'spawn', 'Spawn', 'task',
            'getfenv', 'setfenv', 'gcinfo', 'elapsedTime', 'settings',
            'stats', 'printidentity', 'version', 'UserSettings',
            
            // Roblox services (common)
            'Instance', 'Vector2', 'Vector3', 'CFrame', 'Color3', 'BrickColor',
            'UDim', 'UDim2', 'Ray', 'Region3', 'Rect', 'TweenInfo', 'Enum',
            'NumberRange', 'NumberSequence', 'ColorSequence', 'PhysicalProperties',
            'Faces', 'Axes', 'Random', 'DateTime', 'PathWaypoint', 'DockWidgetPluginGuiInfo',
            
            // Exploit globals
            'getgenv', 'getrenv', 'getsenv', 'getrawmetatable', 'setrawmetatable',
            'hookfunction', 'hookmetamethod', 'newcclosure', 'checkcaller',
            'getcallingscript', 'islclosure', 'iscclosure', 'getinfo', 'debug',
            'Drawing', 'cleardrawcache', 'isreadonly', 'setreadonly',
            'getnamecallmethod', 'setnamecallmethod', 'getconnections',
            'firesignal', 'fireclickdetector', 'fireproximityprompt',
            'setclipboard', 'setfflag', 'getfflag', 'syn', 'fluxus',
            
            // Common self reference
            'self', '_G', '_VERSION', '_ENV'
        ]);
    }

    /**
     * Extract and protect strings that shouldn't be encrypted
     */
    extractProtectedStrings(code) {
        const protected = [];
        // URLs, service names, etc.
        const patterns = [
            /https?:\/\/[^\s"']+/g,
            /GetService\s*\(\s*["']([^"']+)["']\s*\)/g,
            /FindFirstChild\s*\(\s*["']([^"']+)["']\s*\)/g,
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                protected.push(match[0]);
            }
        }
        
        return protected;
    }

    /**
     * Main obfuscation pipeline
     */
    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let code = sourceCode;

            // Preprocessing - remove comments
            code = this.removeComments(code);

            // Tier-based obfuscation
            switch (tier) {
                case 'basic':
                    code = this.applyBasicObfuscation(code);
                    break;
                case 'standard':
                    code = this.applyStandardObfuscation(code);
                    break;
                case 'advanced':
                    code = this.applyAdvancedObfuscation(code);
                    break;
            }

            // Final minification
            code = this.minify(code);

            // Add watermark (optional)
            code = this.addWatermark(code);

            return {
                success: true,
                code: code,
                time: Date.now() - startTime,
                tier: tier
            };

        } catch (error) {
            console.error('[Obfuscator Error]', error);
            return {
                success: false,
                code: '',
                error: error.message,
                time: Date.now() - startTime
            };
        }
    }

    /**
     * Remove comments from code
     */
    removeComments(code) {
        // Remove multi-line comments --[[ ]]
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        // Remove single-line comments
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    /**
     * Basic tier: String encryption only
     */
    applyBasicObfuscation(code) {
        const stringEncrypt = new StringEncrypt(this);
        return stringEncrypt.apply(code);
    }

    /**
     * Standard tier: String + Variables + Numbers
     */
    applyStandardObfuscation(code) {
        let result = code;

        // 1. String Encryption
        const stringEncrypt = new StringEncrypt(this);
        result = stringEncrypt.apply(result);

        // 2. Number Encoding
        const numberEncode = new NumberEncode(this);
        result = numberEncode.apply(result);

        // 3. Variable Renaming
        result = this.renameVariables(result);

        return result;
    }

    /**
     * Advanced tier: All features
     */
    applyAdvancedObfuscation(code) {
        let result = code;

        // 1. Dead Code Injection (before other transforms)
        const deadCode = new DeadCode(this);
        result = deadCode.apply(result);

        // 2. String Encryption (multi-layer)
        const stringEncrypt = new StringEncrypt(this);
        result = stringEncrypt.applyAdvanced(result);

        // 3. Number Encoding
        const numberEncode = new NumberEncode(this);
        result = numberEncode.apply(result);

        // 4. Opaque Predicates
        const opaque = new OpaquePredicates(this);
        result = opaque.apply(result);

        // 5. Variable Renaming
        result = this.renameVariables(result);

        // 6. Control Flow Flattening (on functions)
        const controlFlow = new ControlFlow(this);
        result = controlFlow.apply(result);

        return result;
    }

    /**
     * Rename local variables
     */
    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

        // Find local variable declarations
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;

        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateName());
            }
        }

        // Find function parameters
        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p && p !== '...');
            for (const param of params) {
                if (!protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateName());
                }
            }
        }

        // Apply renames using word boundaries
        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    /**
     * Safe minification
     */
    minify(code) {
        let result = code;

        // Remove empty lines
        result = result.split('\n').filter(line => line.trim()).join('\n');

        // Collapse to single line
        result = result.replace(/\n/g, ' ');

        // Collapse multiple spaces
        result = result.replace(/\s+/g, ' ');

        // Remove spaces around operators (carefully)
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');

        // But keep spaces around keywords and operators that need them
        result = result.replace(/\b(and|or|not|then|do|end|else|elseif|in|local|function|return|if|while|for|repeat|until)\b/g, ' $1 ');

        // Clean up extra spaces
        result = result.replace(/\s+/g, ' ').trim();

        return result;
    }

    /**
     * Add watermark
     */
    addWatermark(code) {
        const watermark = `--[[ Obfuscated by Meson | t.me/mesonobf ]]`;
        return watermark + '\n' + code;
    }
}

module.exports = new MesonObfuscator();
