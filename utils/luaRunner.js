/**
 * Meson Obfuscator v7.0 - Complete Professional Version
 * All transforms + Anti-Tamper + Anti-Debug
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

    // ==================== NAME GENERATION ====================

    generateVarName(style = 'mixed') {
        const styles = {
            single: () => {
                const chars = 'vhQxrSmfKOUTRBCDEFGHIJLNPWYZabcdegijklnopqstuwyz';
                for (const c of chars) {
                    if (!this.usedNames.has(c)) {
                        this.usedNames.add(c);
                        return c;
                    }
                }
                return '_' + (this.varCounter++);
            },
            withNum: () => {
                const base = 'vhQxrSmfKOUTRBCDEFGHIJLNPWYZ';
                const c = base[Math.floor(Math.random() * base.length)];
                const n = Math.floor(Math.random() * 10);
                const name = c + n;
                if (!this.usedNames.has(name)) {
                    this.usedNames.add(name);
                    return name;
                }
                return '_' + (this.varCounter++);
            },
            Il1: () => {
                let name = '';
                for (let i = 0; i < 6; i++) {
                    name += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                if (!this.usedNames.has(name)) {
                    this.usedNames.add(name);
                    return name;
                }
                return '_' + (this.varCounter++);
            },
            mixed: () => {
                const all = ['single', 'withNum', 'Il1'];
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
        
        // String Encryption
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        code = this.minify(code);
        return '--[[Meson v7.0]]\n' + code;
    }

    // ==================== STANDARD TIER ====================

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        
        // String Encryption
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        // Number Encoding
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        // Dead Code
        const deadCode = new DeadCode(this);
        code = deadCode.apply(code);
        
        // Variable Renaming
        code = this.renameVariables(code);
        
        code = this.minify(code);
        return '--[[Meson v7.0]]\n' + code;
    }

    // ==================== ADVANCED TIER ====================

    applyAdvancedObfuscation(code) {
        code = this.removeComments(code);
        
        // Anti-Tamper (First layer of protection)
        const antiTamper = new AntiTamper(this);
        code = antiTamper.apply(code);
        
        // Anti-Debug
        const antiDebug = new AntiDebug(this);
        code = antiDebug.apply(code);
        
        // Function Wrapping
        const funcWrap = new FunctionWrap(this);
        code = funcWrap.apply(code);
        
        // String Splitting (before encryption)
        const stringSplit = new StringSplit(this);
        code = stringSplit.apply(code);
        
        // String Encryption
        const stringEnc = new StringEncrypt(this);
        code = stringEnc.apply(code);
        
        // Number Encoding
        const numEnc = new NumberEncode(this);
        code = numEnc.apply(code);
        
        // Proxy Functions
        const proxyFunc = new ProxyFunction(this);
        code = proxyFunc.apply(code);
        
        // Table Indirection
        const tableInd = new TableIndirect(this);
        code = tableInd.apply(code);
        
        // Dead Code
        const deadCode = new DeadCode(this);
        code = deadCode.apply(code);
        
        // Junk Loops
        const junkLoops = new JunkLoops(this);
        code = junkLoops.apply(code);
        
        // Opaque Predicates
        const opaque = new OpaquePredicates(this);
        code = opaque.apply(code);
        
        // Control Flow
        const controlFlow = new ControlFlow(this);
        code = controlFlow.apply(code);
        
        // Variable Renaming (last step)
        code = this.renameVariables(code);
        
        code = this.minify(code);
        return '--[[Meson v7.0|Protected]]\n' + code;
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

        // Find local variable declarations
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateVarName());
            }
        }

        // Find function parameters
        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p && p !== '...');
            for (const param of params) {
                if (!protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateVarName());
                }
            }
        }

        // Apply renames
        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp('\\b' + oldName + '\\b', 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    minify(code) {
        let result = code;
        result = result.split('\n').map(line => line.trim()).filter(line => line.length > 0).join(' ');
        result = result.replace(/\s+/g, ' ');
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');
        result = result.replace(/\b(and|or|not|then|do|end|else|elseif|in|local|function|return|if|while|for|repeat|until)\b/g, ' $1 ');
        result = result.replace(/\s+/g, ' ');
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
            'Drawing', 'setclipboard', 'self', '_G', '_VERSION', '_ENV'
        ]);
    }
}

module.exports = new MesonObfuscator();
