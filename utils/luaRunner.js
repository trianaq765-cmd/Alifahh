/**
 * Meson Obfuscator v3.0 - VM-Based Obfuscation
 * Professional grade Lua obfuscator with custom VM
 */

const VMCompiler = require('./vm/compiler');
const VMGenerator = require('./vm/vmGenerator');
const BytecodeEncrypt = require('./vm/bytecodeEncrypt');

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.varCounter = 0;
        this.usedNames = new Set();
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        this.vmKey = Math.floor(Math.random() * 65535);
    }

    /**
     * Generate obfuscated name with multiple styles
     */
    generateName(style = 'mixed') {
        const styles = {
            'Il1': () => {
                let n = '_';
                for (let i = 0; i < 8 + Math.floor(Math.random() * 4); i++) {
                    n += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                return n;
            },
            'O0o': () => {
                let n = '_';
                for (let i = 0; i < 6 + Math.floor(Math.random() * 4); i++) {
                    n += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                return n;
            },
            'hex': () => '_0x' + Math.random().toString(16).substr(2, 8),
            'short': () => {
                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let n = chars[Math.floor(Math.random() * 52)];
                for (let i = 0; i < 2; i++) {
                    n += chars[Math.floor(Math.random() * 52)] + Math.floor(Math.random() * 10);
                }
                return n;
            },
            'mixed': () => {
                const all = ['Il1', 'O0o', 'hex', 'short'];
                return styles[all[Math.floor(Math.random() * all.length)]]();
            }
        };

        let name;
        let attempts = 0;
        do {
            name = styles[style]();
            attempts++;
        } while (this.usedNames.has(name) && attempts < 100);

        this.usedNames.add(name);
        return name;
    }

    /**
     * Format number in obfuscated way
     */
    formatNumber(num) {
        const formats = [
            () => `0x${num.toString(16).toUpperCase()}`,
            () => `0X${num.toString(16)}`,
            () => `0b${num.toString(2)}`,
            () => `0B${num.toString(2).replace(/(.{4})/g, '$1_').replace(/_$/, '')}`,
            () => num.toString(),
            () => {
                if (num > 100) {
                    const a = Math.floor(num / 2);
                    return `(${this.formatNumber(a)}+${this.formatNumber(num - a)})`;
                }
                return num.toString();
            }
        ];
        return formats[Math.floor(Math.random() * formats.length)]();
    }

    /**
     * Generate watermark
     */
    generateWatermark() {
        const timestamp = Date.now().toString(36);
        return `--[[ Meson Obfuscator v3.0 | ${timestamp} | meson.dev ]]\n`;
    }

    /**
     * Main obfuscation entry point
     */
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
                case 'vm':
                case 'ultimate':
                    output = this.applyVMObfuscation(sourceCode);
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
        code = this.encryptStrings(code);
        code = this.minify(code);
        return this.generateWatermark() + code;
    }

    // ==================== STANDARD TIER ====================
    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.addDeadCode(code);
        code = this.minify(code);
        return this.generateWatermark() + code;
    }

    // ==================== ADVANCED TIER ====================
    applyAdvancedObfuscation(code) {
        code = this.removeComments(code);
        code = this.addDeadCode(code);
        code = this.encryptStringsAdvanced(code);
        code = this.encodeNumbers(code);
        code = this.addOpaquePredicates(code);
        code = this.renameVariables(code);
        code = this.wrapControlFlow(code);
        code = this.minify(code);
        return this.generateWatermark() + code;
    }

    // ==================== VM TIER (NEW!) ====================
    applyVMObfuscation(sourceCode) {
        const compiler = new VMCompiler(this);
        const generator = new VMGenerator(this);
        const encryptor = new BytecodeEncrypt(this);

        // Step 1: Compile to bytecode
        const bytecode = compiler.compile(sourceCode);

        // Step 2: Encrypt bytecode
        const encrypted = encryptor.encrypt(bytecode);

        // Step 3: Generate VM
        const vm = generator.generate(encrypted);

        return this.generateWatermark() + vm;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    generateDecoder() {
        const funcName = this.generateName();
        const keyVar = this.generateName();
        const key = this.stringKey;

        const decoder = `local ${funcName};do local ${keyVar}=${this.formatNumber(key)};${funcName}=function(${this.generateName()})local ${this.generateName()}=""for ${this.generateName()}=1,#${this.generateName()} do ${this.generateName()}=${this.generateName()}..string.char((bit32 and bit32.bxor or function(a,b)local p,c=1,0;while a>0 and b>0 do local ra,rb=a%2,b%2;if ra~=rb then c=c+p end;a,b,p=(a-ra)/2,(b-rb)/2,p*2 end;if a<b then a=b end;while a>0 do local ra=a%2;if ra>0 then c=c+p end;a,p=(a-ra)/2,p*2 end;return c end)(${this.generateName()}[${this.generateName()}],${keyVar}))end return ${this.generateName()} end end;`;

        return { name: funcName, code: decoder };
    }

    encryptString(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ this.stringKey);
        }
        return bytes;
    }

    encryptStrings(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const decoder = this.generateDecoder();
        
        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        let result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 3 || content.includes('\\')) return match;
            
            const encrypted = this.encryptString(content);
            return `${decoder.name}({${encrypted.map(b => this.formatNumber(b)).join(',')}})`;
        });

        return decoder.code + result;
    }

    encryptStringsAdvanced(code) {
        // Multi-layer encryption
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const key2 = Math.floor(Math.random() * 100) + 20;
        
        const funcName = this.generateName();
        const tableVar = this.generateName();
        
        const decoder = `local ${funcName};do local ${tableVar}={};for i=0,255 do ${tableVar}[i]=string.char(i)end;${funcName}=function(e,k)local r=""for i=1,#e do local c=e[i]local x=(bit32 and bit32.bxor(c,k)or c)r=r..(${tableVar}[x]or string.char(x))end return r end end;`;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        let result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 3 || content.includes('\\')) return match;
            
            const encrypted = [];
            for (let i = 0; i < content.length; i++) {
                encrypted.push(content.charCodeAt(i) ^ this.stringKey);
            }
            
            return `${funcName}({${encrypted.map(b => this.formatNumber(b)).join(',')}},${this.formatNumber(this.stringKey)})`;
        });

        return decoder.code + result;
    }

    encodeNumbers(code) {
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxXbB])/g;
        
        return code.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            if (n < 2 || n > 99999 || Math.random() > 0.6) return match;

            const methods = [
                () => {
                    const a = Math.floor(Math.random() * 1000);
                    return `(${this.formatNumber(a)}+${this.formatNumber(n - a)})`;
                },
                () => {
                    const a = n + Math.floor(Math.random() * 1000);
                    return `(${this.formatNumber(a)}-${this.formatNumber(a - n)})`;
                },
                () => this.formatNumber(n)
            ];

            return methods[Math.floor(Math.random() * methods.length)]();
        });
    }

    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

        // Local variables
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateName());
            }
        }

        // Function parameters
        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p && p !== '...');
            for (const param of params) {
                if (!protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateName());
                }
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    addDeadCode(code) {
        const deadSnippets = [];
        const count = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < count; i++) {
            const v = this.generateName();
            const type = Math.floor(Math.random() * 6);
            
            switch (type) {
                case 0:
                    deadSnippets.push(`local ${v}=${this.formatNumber(Math.floor(Math.random() * 10000))};`);
                    break;
                case 1:
                    deadSnippets.push(`local ${v}=function()return nil end;`);
                    break;
                case 2:
                    const a = Math.floor(Math.random() * 100) + 100;
                    deadSnippets.push(`if ${this.formatNumber(a)}>${this.formatNumber(a + 50)} then local ${v}=nil end;`);
                    break;
                case 3:
                    deadSnippets.push(`local ${v}={[${this.formatNumber(Math.floor(Math.random() * 100))}]=nil};`);
                    break;
                case 4:
                    deadSnippets.push(`local ${v}=string.rep("",0);`);
                    break;
                case 5:
                    const b = Math.floor(Math.random() * 100);
                    deadSnippets.push(`local ${v}=math.floor(${this.formatNumber(b)}*0);`);
                    break;
            }
        }

        return deadSnippets.join('') + code;
    }

    addOpaquePredicates(code) {
        const checkVar = this.generateName();
        const predicates = [
            () => `(${this.formatNumber(Math.floor(Math.random() * 100) + 1)}*${this.formatNumber(Math.floor(Math.random() * 100) + 1)}>=${this.formatNumber(1)})`,
            () => `(type("")=="string")`,
            () => `(type({})=="table")`,
            () => `(#""==${this.formatNumber(0)})`,
        ];

        const pred = predicates[Math.floor(Math.random() * predicates.length)]();
        return `local ${checkVar}=${pred};if not ${checkVar} then return end;` + code;
    }

    wrapControlFlow(code) {
        const stateVar = this.generateName();
        const funcVar = this.generateName();
        
        return `local ${stateVar}=${this.formatNumber(1)};local ${funcVar}={[${this.formatNumber(1)}]=function()${code};${stateVar}=${this.formatNumber(0)} end};while ${stateVar}>${this.formatNumber(0)} do if ${funcVar}[${stateVar}]then ${funcVar}[${stateVar}]()end end;`;
    }

    minify(code) {
        let result = code;
        result = result.split('\n').filter(line => line.trim()).join(' ');
        result = result.replace(/\s+/g, ' ');
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');
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
            'setmetatable', 'getmetatable', 'require', 'loadstring',
            'string', 'table', 'math', 'bit32', 'bit', 'coroutine', 'debug',
            'os', 'io', 'utf8', 'game', 'workspace', 'script', 'shared',
            'tick', 'time', 'wait', 'delay', 'spawn', 'task',
            'getfenv', 'setfenv', 'getgenv', 'getrenv', 'getsenv',
            'Instance', 'Vector2', 'Vector3', 'CFrame', 'Color3', 'BrickColor',
            'UDim', 'UDim2', 'Ray', 'Region3', 'TweenInfo', 'Enum',
            'getrawmetatable', 'setrawmetatable', 'hookfunction', 'newcclosure',
            'Drawing', 'setclipboard', 'self', '_G', '_VERSION'
        ]);
    }
}

module.exports = new MesonObfuscator();
