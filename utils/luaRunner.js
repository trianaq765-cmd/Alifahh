/**
 * Meson Obfuscator v7.2 - STABLE & SAFE
 * Fixed syntax errors by sanitizing transforms
 */

// Import transforms
const StringEncrypt = require('./transforms/stringEncrypt');
const NumberEncode = require('./transforms/numberEncode');
// const ControlFlow = require('./transforms/controlFlow'); // Disabled for safety
// const DeadCode = require('./transforms/deadCode');       // Disabled for safety
// const JunkLoops = require('./transforms/junkLoops');     // Disabled for safety
const StringSplit = require('./transforms/stringSplit');
const FunctionWrap = require('./transforms/functionWrap');
const AntiTamper = require('./transforms/antiTamper');
const AntiDebug = require('./transforms/antiDebug');

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.varCounter = 0;
        this.usedNames = new Set();
        this.stringKey = Math.floor(Math.random() * 200) + 50;
    }

    // ==================== NAME GENERATION (SAFE) ====================

    generateVarName() {
        // ALWAYS start with underscore + letter to be 100% safe
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const c1 = chars[Math.floor(Math.random() * chars.length)];
        const c2 = chars[Math.floor(Math.random() * chars.length)];
        const c3 = chars[Math.floor(Math.random() * chars.length)];
        
        let name = '_' + c1 + c2 + c3 + (this.varCounter++);
        return name;
    }

    formatNumber(num) {
        if (num < 0) return '(-' + Math.abs(num) + ')';
        // Keep it simple to avoid parsing errors
        return num.toString();
    }

    // ==================== MAIN ENTRY ====================

    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let output;

            // PRE-PROCESSING
            // Ensure code ends with newline/semicolon to prevent merge errors
            let code = sourceCode.trim() + '\n';
            code = this.removeComments(code);

            // Apply transforms based on tier
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
                default:
                    code = this.applyBasicObfuscation(code);
            }

            return {
                success: true,
                code: output = code,
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

    // ==================== TIER IMPLEMENTATIONS ====================

    applyBasicObfuscation(code) {
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        code = this.minify(code);
        return '--[[Meson v7.2]]\n' + code;
    }

    applyStandardObfuscation(code) {
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        code = this.renameVariables(code);
        
        code = this.minify(code);
        return '--[[Meson v7.2]]\n' + code;
    }

    applyAdvancedObfuscation(code) {
        // 1. Protection Layers
        const antiTamper = new AntiTamper(this);
        code = antiTamper.apply(code);
        
        const antiDebug = new AntiDebug(this);
        code = antiDebug.apply(code);
        
        // 2. Structural Changes (Safe ones)
        const funcWrap = new FunctionWrap(this);
        code = funcWrap.apply(code);
        
        const stringSplit = new StringSplit(this);
        code = stringSplit.apply(code);
        
        // 3. Data Obfuscation
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        // 4. Final Rename
        code = this.renameVariables(code);
        
        // 5. Minify safely
        code = this.minify(code);
        
        return '--[[Meson v7.2|Protected]]\n' + code;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        return code
            .replace(/--\[\[[\s\S]*?\]\]/g, ' ') // Block comments -> space
            .replace(/--[^\n]*/g, ' ');          // Line comments -> space
    }

    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

        // Safe regex for local variables
        const localPattern = /(?:\b)local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateVarName());
            }
        }

        // Safe regex for function parameters
        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim());
            for (const param of params) {
                if (param && param !== '...' && !protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateVarName());
                }
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            // Very careful replacement using word boundaries
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    minify(code) {
        let result = code;
        
        // Normalize whitespace
        result = result.replace(/\s+/g, ' ');
        
        // Remove spaces around operators (carefully)
        result = result.replace(/\s*([=+\-*/%^#<>~,{}()\[\]])\s*/g, '$1');
        
        // Ensure spaces around keywords
        const keywords = ['and','break','do','else','elseif','end','false','for','function','if','in','local','nil','not','or','repeat','return','then','true','until','while'];
        
        // Add spaces around keywords if they touch other words
        keywords.forEach(kw => {
            result = result.replace(new RegExp(`([^a-zA-Z0-9_])${kw}([^a-zA-Z0-9_])`, 'g'), `$1 ${kw} $2`);
        });
        
        // Fix potential semicolon issues
        result = result.replace(/;+/g, ';'); // dedupe semicolons
        
        return result.trim();
    }

    getProtectedNames() {
        return new Set([
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or',
            'repeat', 'return', 'then', 'true', 'until', 'while', 'continue',
            'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs',
            'ipairs', 'next', 'select', 'unpack', 'pcall', 'xpcall',
            'tonumber', 'tostring', 'rawget', 'rawset', 'rawequal',
            'setmetatable', 'getmetatable', 'require', 'loadstring', 'load',
            'string', 'table', 'math', 'bit32', 'bit', 'coroutine', 'debug',
            'os', 'io', 'utf8', 'game', 'workspace', 'script', 'shared',
            'tick', 'time', 'wait', 'delay', 'spawn', 'task',
            'getfenv', 'setfenv', 'getgenv', 'getrenv', 'getsenv',
            'Instance', 'Vector2', 'Vector3', 'CFrame', 'Color3', 'BrickColor',
            'UDim', 'UDim2', 'Ray', 'Region3', 'TweenInfo', 'Enum',
            'getrawmetatable', 'setrawmetatable', 'hookfunction', 'newcclosure',
            'Drawing', 'setclipboard', 'self', '_G', '_VERSION', '_ENV', '...'
        ]);
    }
}

module.exports = new MesonObfuscator();
