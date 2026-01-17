/**
 * Meson Obfuscator v7.1 - Fixed Identifier & Syntax Errors
 */

// Import transforms
const StringEncrypt = require('./transforms/stringEncrypt');
const NumberEncode = require('./transforms/numberEncode');
const ControlFlow = require('./transforms/controlFlow');
const DeadCode = require('./transforms/deadCode');
const OpaquePredicates = require('./transforms/opaquePredicates');
const StringSplit = require('./transforms/stringSplit');
const FunctionWrap = require('./transforms/functionWrap');
const TableIndirect = require('./transforms/tableIndirect');
const ProxyFunction = require('./transforms/proxyFunction');
const JunkLoops = require('./transforms/junkLoops');
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

    // ==================== NAME GENERATION (FIXED) ====================

    generateVarName(style = 'mixed') {
        const styles = {
            single: () => {
                // Style: _a, _b
                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                for (const c of chars) {
                    const name = '_' + c;
                    if (!this.usedNames.has(name)) {
                        this.usedNames.add(name);
                        return name;
                    }
                }
                return '_' + (this.varCounter++);
            },
            Il1: () => {
                // Style: _Il1I1
                let name = '_'; // ALWAYS start with underscore to prevent '1' error
                for (let i = 0; i < 6; i++) {
                    name += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                if (!this.usedNames.has(name)) {
                    this.usedNames.add(name);
                    return name;
                }
                return '_' + (this.varCounter++);
            },
            O0o: () => {
                // Style: _O0o0O
                let name = '_'; // ALWAYS start with underscore
                for (let i = 0; i < 6; i++) {
                    name += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                if (!this.usedNames.has(name)) {
                    this.usedNames.add(name);
                    return name;
                }
                return '_' + (this.varCounter++);
            },
            mixed: () => {
                // Randomly pick a style
                const all = ['single', 'Il1', 'O0o'];
                return styles[all[Math.floor(Math.random() * all.length)]]();
            }
        };
        
        return styles[style] ? styles[style]() : styles.mixed();
    }

    formatNumber(num) {
        if (num < 0) return '(-' + this.formatNumber(-num) + ')';
        const r = Math.random();
        if (r < 0.20) return '0x' + num.toString(16).toUpperCase();
        if (r < 0.35) return '0X' + num.toString(16);
        if (r < 0.45 && num < 256) return '0b' + num.toString(2);
        return num.toString();
    }

    // ==================== MAIN ENTRY ====================

    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let output;

            switch (tier) {
                case 'basic':
                    output = this.applyBasicObfuscation(sourceCode);
                    break;
                case 'standard':
                    output = this.applyStandardObfuscation(sourceCode);
                    break;
                case 'advanced':
                    output = this.applyAdvancedObfuscation(sourceCode);
                    break;
                default:
                    output = this.applyBasicObfuscation(sourceCode);
            }

            return {
                success: true,
                code: output,
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

    // ==================== BASIC TIER ====================

    applyBasicObfuscation(code) {
        code = this.removeComments(code);
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        code = this.minify(code);
        return '--[[Meson v7.1]]\n' + code;
    }

    // ==================== STANDARD TIER ====================

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        const deadCode = new DeadCode(this);
        code = deadCode.apply(code);
        
        code = this.renameVariables(code);
        code = this.minify(code);
        return '--[[Meson v7.1]]\n' + code;
    }

    // ==================== ADVANCED TIER ====================

    applyAdvancedObfuscation(code) {
        code = this.removeComments(code);
        
        // 1. Protection Layers (Top Level)
        const antiTamper = new AntiTamper(this);
        code = antiTamper.apply(code);
        
        const antiDebug = new AntiDebug(this);
        code = antiDebug.apply(code);
        
        // 2. Structural Changes
        const funcWrap = new FunctionWrap(this);
        code = funcWrap.apply(code);
        
        const stringSplit = new StringSplit(this);
        code = stringSplit.apply(code);
        
        // 3. Data Obfuscation
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        // 4. Logic Obfuscation
        const proxyFunc = new ProxyFunction(this);
        code = proxyFunc.apply(code);
        
        const tableInd = new TableIndirect(this);
        code = tableInd.apply(code);
        
        const deadCode = new DeadCode(this);
        code = deadCode.apply(code);
        
        const junkLoops = new JunkLoops(this);
        code = junkLoops.apply(code);
        
        const opaque = new OpaquePredicates(this);
        code = opaque.apply(code);
        
        const controlFlow = new ControlFlow(this);
        code = controlFlow.apply(code);
        
        // 5. Final Rename
        code = this.renameVariables(code);
        code = this.minify(code);
        
        return '--[[Meson v7.1|Protected]]\n' + code;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

        // Regex lebih aman untuk menangkap variable
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateVarName());
            }
        }

        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p && p !== '...');
            for (const param of params) {
                if (param && !protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateVarName());
                }
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            // Gunakan word boundary (\b) agar tidak me-replace substring
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    minify(code) {
        let result = code;
        // Hapus empty lines
        result = result.split('\n').map(l => l.trim()).filter(l => l).join(' ');
        // Collapse spaces
        result = result.replace(/\s+/g, ' ');
        // Hapus spasi di sekitar operator
        result = result.replace(/\s*([{}()\[\],;=<>+\-*/%^#])\s*/g, '$1');
        // Pastikan keyword tetap terpisah (contoh: 'end' dan 'local')
        result = result.replace(/\b(and|or|not|then|do|end|else|elseif|in|local|function|return|if|while|for|repeat|until)\b/g, ' $1 ');
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
