/**
 * Meson Obfuscator v3.1 - Fixed VM-Based Obfuscator
 * Roblox Executor Compatible
 */

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
    
    generateName(style = 'mixed') {
        const styles = {
            'Il1': () => {
                let n = '_';
                for (let i = 0; i < 8 + Math.floor(Math.random() * 4); i++) {
                    n += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                return n + (this.varCounter++);
            },
            'O0o': () => {
                let n = '_';
                for (let i = 0; i < 6 + Math.floor(Math.random() * 4); i++) {
                    n += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                return n + (this.varCounter++);
            },
            'hex': () => '_0x' + Math.random().toString(16).substr(2, 6) + (this.varCounter++),
            'mixed': () => {
                const all = ['Il1', 'O0o', 'hex'];
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

    formatNumber(num) {
        if (num < 0) return `(${this.formatNumber(-num)}*-1)`;
        const formats = [
            () => `0x${num.toString(16).toUpperCase()}`,
            () => `0X${num.toString(16)}`,
            () => num < 256 ? `0b${num.toString(2)}` : num.toString(),
            () => num.toString()
        ];
        return formats[Math.floor(Math.random() * formats.length)]();
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
        return `--[[ Meson Obfuscator v3.1 ]]\n` + code;
    }

    // ==================== STANDARD TIER ====================

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.addDeadCode(code);
        code = this.minify(code);
        return `--[[ Meson Obfuscator v3.1 ]]\n` + code;
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
        return `--[[ Meson Obfuscator v3.1 ]]\n` + code;
    }

    // ==================== VM TIER (FIXED FOR ROBLOX) ====================

    applyVMObfuscation(sourceCode) {
        const preparedCode = this.removeComments(sourceCode);
        return this.generateVMStructure(preparedCode);
    }

    generateVMStructure(sourceCode) {
        // Variable names for VM components
        const v = {
            wrapper: this.generateName(),
            decoder: this.generateName(),
            key: this.generateName(),
            data: this.generateName(),
            result: this.generateName(),
            chunk: this.generateName(),
            err: this.generateName(),
            i: this.generateName(),
            c: this.generateName(),
            bxor: this.generateName(),
            strchar: this.generateName(),
            strbyte: this.generateName(),
            tblconcat: this.generateName(),
            loadfn: this.generateName(),
            output: this.generateName(),
            temp: this.generateName(),
            a: this.generateName(),
            b: this.generateName(),
            p: this.generateName(),
            ra: this.generateName(),
            rb: this.generateName(),
        };

        // Encryption key
        const encKey = Math.floor(Math.random() * 200) + 50;

        // Encrypt the source code
        const codeBytes = this.encryptStringToArray(sourceCode, encKey);
        
        // Generate bytecode array string with mixed number formats
        const bytecodeStr = codeBytes.map(b => this.formatNumber(b)).join(',');

        // Generate the complete VM output - FIXED VERSION without setmetatable on protected tables
        const output = `--[[ Meson Obfuscator v3.1 | VM Protected ]]
return(function(...)
local ${v.key}=${this.formatNumber(encKey)};
local ${v.strchar}=string.char;
local ${v.strbyte}=string.byte;
local ${v.tblconcat}=table.concat;
local ${v.loadfn}=loadstring or load;
local ${v.bxor}=bit32 and bit32.bxor or bit and bit.bxor or function(${v.a},${v.b})
local ${v.p},${v.c}=1,0;
while ${v.a}>0 and ${v.b}>0 do
local ${v.ra},${v.rb}=${v.a}%2,${v.b}%2;
if ${v.ra}~=${v.rb} then ${v.c}=${v.c}+${v.p} end;
${v.a},${v.b},${v.p}=(${v.a}-${v.ra})/2,(${v.b}-${v.rb})/2,${v.p}*2;
end;
if ${v.a}<${v.b} then ${v.a}=${v.b} end;
while ${v.a}>0 do
local ${v.ra}=${v.a}%2;
if ${v.ra}>0 then ${v.c}=${v.c}+${v.p} end;
${v.a},${v.p}=(${v.a}-${v.ra})/2,${v.p}*2;
end;
return ${v.c};
end;
local ${v.data}={${bytecodeStr}};
local ${v.decoder}=function(${v.temp})
local ${v.output}={};
for ${v.i}=1,#${v.temp} do
${v.output}[${v.i}]=${v.strchar}(${v.bxor}(${v.temp}[${v.i}],${v.key}));
end;
return ${v.tblconcat}(${v.output});
end;
local ${v.result}=${v.decoder}(${v.data});
local ${v.chunk},${v.err}=${v.loadfn}(${v.result});
if not ${v.chunk} then
error("Meson: "..(${v.err} or "Unknown error"));
end;
return ${v.chunk}(...);
end)(...)`;

        return this.minifyVM(output);
    }

    encryptStringToArray(str, key) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ key);
        }
        return bytes;
    }

    // Special minify for VM that preserves structure
    minifyVM(code) {
        let result = code;
        // Remove extra whitespace but keep newlines for readability
        result = result.split('\n').map(line => line.trim()).filter(line => line).join('\n');
        // Collapse multiple spaces
        result = result.replace(/  +/g, ' ');
        return result;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encryptStrings(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const funcName = this.generateName();
        const keyVar = this.generateName();
        const eVar = this.generateName();
        const rVar = this.generateName();
        const iVar = this.generateName();
        const aVar = this.generateName();
        const bVar = this.generateName();
        const pVar = this.generateName();
        const cVar = this.generateName();
        const raVar = this.generateName();
        const rbVar = this.generateName();
        
        const decoder = `local ${funcName};do local ${keyVar}=${this.formatNumber(this.stringKey)};${funcName}=function(${eVar})local ${rVar}=""for ${iVar}=1,#${eVar} do ${rVar}=${rVar}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(${aVar},${bVar})local ${pVar},${cVar}=1,0;while ${aVar}>0 and ${bVar}>0 do local ${raVar},${rbVar}=${aVar}%2,${bVar}%2;if ${raVar}~=${rbVar} then ${cVar}=${cVar}+${pVar} end;${aVar},${bVar},${pVar}=(${aVar}-${raVar})/2,(${bVar}-${rbVar})/2,${pVar}*2 end;if ${aVar}<${bVar} then ${aVar}=${bVar} end;while ${aVar}>0 do local ${raVar}=${aVar}%2;if ${raVar}>0 then ${cVar}=${cVar}+${pVar} end;${aVar},${pVar}=(${aVar}-${raVar})/2,${pVar}*2 end;return ${cVar} end)(${eVar}[${iVar}],${keyVar}))end return ${rVar} end end;`;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        let result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 2 || content.includes('\\')) return match;
            
            const encrypted = [];
            for (let i = 0; i < content.length; i++) {
                encrypted.push(content.charCodeAt(i) ^ this.stringKey);
            }
            return `${funcName}({${encrypted.map(b => this.formatNumber(b)).join(',')}})`;
        });

        return decoder + result;
    }

    encryptStringsAdvanced(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const funcName = this.generateName();
        const tableVar = this.generateName();
        const eVar = this.generateName();
        const kVar = this.generateName();
        const rVar = this.generateName();
        const iVar = this.generateName();
        const cVar = this.generateName();
        const xVar = this.generateName();
        
        const decoder = `local ${funcName};do local ${tableVar}={};for ${iVar}=0,255 do ${tableVar}[${iVar}]=string.char(${iVar})end;${funcName}=function(${eVar},${kVar})local ${rVar}=""for ${iVar}=1,#${eVar} do local ${cVar}=${eVar}[${iVar}]local ${xVar}=(bit32 and bit32.bxor(${cVar},${kVar})or bit and bit.bxor(${cVar},${kVar})or ${cVar})${rVar}=${rVar}..(${tableVar}[${xVar}]or string.char(${xVar}))end return ${rVar} end end;`;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        let result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 2 || content.includes('\\')) return match;
            
            const encrypted = [];
            for (let i = 0; i < content.length; i++) {
                encrypted.push(content.charCodeAt(i) ^ this.stringKey);
            }
            
            return `${funcName}({${encrypted.map(b => this.formatNumber(b)).join(',')}},${this.formatNumber(this.stringKey)})`;
        });

        return decoder + result;
    }

    encodeNumbers(code) {
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxXbB])/g;
        
        return code.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            if (n < 2 || n > 99999 || Math.random() > 0.5) return match;

            const methods = [
                () => {
                    const a = Math.floor(Math.random() * 500);
                    return `(${this.formatNumber(a)}+${this.formatNumber(n - a)})`;
                },
                () => {
                    const a = n + Math.floor(Math.random() * 500);
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

        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateName());
            }
        }

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
        const snippets = [];
        const count = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < count; i++) {
            const v = this.generateName();
            const type = Math.floor(Math.random() * 5);
            
            switch (type) {
                case 0:
                    snippets.push(`local ${v}=${this.formatNumber(Math.floor(Math.random() * 10000))};`);
                    break;
                case 1:
                    snippets.push(`local ${v}=function()return nil end;`);
                    break;
                case 2:
                    const a = Math.floor(Math.random() * 100) + 100;
                    snippets.push(`if ${this.formatNumber(a)}>${this.formatNumber(a + 50)} then local ${v}=nil end;`);
                    break;
                case 3:
                    snippets.push(`local ${v}={};`);
                    break;
                case 4:
                    snippets.push(`local ${v}=string.rep("",0);`);
                    break;
            }
        }

        return snippets.join('') + code;
    }

    addOpaquePredicates(code) {
        const checkVar = this.generateName();
        const predicates = [
            `(${this.formatNumber(Math.floor(Math.random() * 100) + 1)}*${this.formatNumber(Math.floor(Math.random() * 100) + 1)}>=${this.formatNumber(1)})`,
            `(type("")=="string")`,
            `(type({})=="table")`,
            `(#""==${this.formatNumber(0)})`
        ];

        const pred = predicates[Math.floor(Math.random() * predicates.length)];
        return `local ${checkVar}=${pred};if not ${checkVar} then return end;` + code;
    }

    wrapControlFlow(code) {
        const stateVar = this.generateName();
        const funcVar = this.generateName();
        
        return `local ${stateVar}=${this.formatNumber(1)};local ${funcVar}={[${this.formatNumber(1)}]=function()${code};${stateVar}=${this.formatNumber(0)}end};while ${stateVar}>${this.formatNumber(0)} do if ${funcVar}[${stateVar}]then ${funcVar}[${stateVar}]()end end;`;
    }

    minify(code) {
        let result = code;
        result = result.split('\n').map(line => line.trim()).filter(line => line).join(' ');
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
