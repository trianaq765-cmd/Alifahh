/**
 * Meson Obfuscator v4.0 - Professional VM-Based Obfuscator
 * Luraph-style output with complex table structures
 */

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.varCounter = 0;
        this.usedNames = new Set();
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        this.shortNames = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.usedShortNames = new Set();
    }

    // ==================== NAME GENERATION ====================
    
    // Generate short names like Luraph (v, h, Q, x, r, S, m)
    generateShortName() {
        const available = [];
        for (const c of this.shortNames) {
            if (!this.usedShortNames.has(c)) {
                available.push(c);
            }
        }
        
        if (available.length > 0) {
            const name = available[Math.floor(Math.random() * available.length)];
            this.usedShortNames.add(name);
            return name;
        }
        
        // Fallback to two-letter names
        const c1 = this.shortNames[Math.floor(Math.random() * this.shortNames.length)];
        const c2 = Math.floor(Math.random() * 10);
        return c1 + c2;
    }

    // Generate function names like w, e, f, Q2, R, R6, etc.
    generateFuncName() {
        const styles = [
            () => this.generateShortName(),
            () => this.generateShortName() + Math.floor(Math.random() * 10),
            () => this.generateShortName().toUpperCase() + Math.floor(Math.random() * 10),
            () => '_' + this.generateShortName(),
        ];
        return styles[Math.floor(Math.random() * styles.length)]();
    }

    generateName(style = 'mixed') {
        const styles = {
            'Il1': () => {
                let n = '';
                for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
                    n += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                return n;
            },
            'O0o': () => {
                let n = '';
                for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
                    n += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                return n;
            },
            'hex': () => '_0x' + Math.random().toString(16).substr(2, 4),
            'short': () => this.generateShortName(),
            'func': () => this.generateFuncName(),
            'mixed': () => {
                const all = ['Il1', 'O0o', 'hex', 'short'];
                return styles[all[Math.floor(Math.random() * all.length)]]();
            }
        };

        let name;
        let attempts = 0;
        do {
            name = styles[style] ? styles[style]() : styles['mixed']();
            attempts++;
        } while (this.usedNames.has(name) && attempts < 100);

        this.usedNames.add(name);
        return name;
    }

    // Format numbers with various styles (hex, binary, decimal, with underscores)
    formatNumber(num) {
        if (num < 0) return `(-${this.formatNumber(-num)})`;
        
        const formats = [
            // Hex variations
            () => `0x${num.toString(16).toUpperCase()}`,
            () => `0X${num.toString(16)}`,
            () => `0x${num.toString(16)}`,
            // Binary (for smaller numbers)
            () => num < 512 ? `0b${num.toString(2)}` : num.toString(),
            () => num < 512 ? `0B${num.toString(2).replace(/(.{4})(?=.)/g, '$1_')}` : num.toString(),
            // Decimal with underscores
            () => num > 1000 ? num.toString().replace(/\B(?=(\d{2})+(?!\d))/g, '_') : num.toString(),
            // Plain
            () => num.toString()
        ];
        
        return formats[Math.floor(Math.random() * formats.length)]();
    }

    // Generate random constant array for fake data
    generateConstArray(length = 9) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 4294967295));
        }
        return arr;
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
        return `--[[ Meson Obfuscator v4.0 ]]\n` + code;
    }

    // ==================== STANDARD TIER ====================

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.addDeadCode(code);
        code = this.minify(code);
        return `--[[ Meson Obfuscator v4.0 ]]\n` + code;
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
        return `--[[ Meson Obfuscator v4.0 ]]\n` + code;
    }

    // ==================== VM TIER (PROFESSIONAL - LURAPH STYLE) ====================

    applyVMObfuscation(sourceCode) {
        const preparedCode = this.removeComments(sourceCode);
        return this.generateProfessionalVM(preparedCode);
    }

    generateProfessionalVM(sourceCode) {
        // Reset short names for clean generation
        this.usedShortNames = new Set();
        
        // Generate main function/variable names (Luraph style)
        const funcs = {};
        const funcNames = ['w', 'e', 'f', 'Q', 'R', 'N', 'I', 'X', 'n', 'd', 'u', 'G', 'a', 'V', 'U', 'S', 'P', 'L', 'z', 'l', 'g', 'D', 'K', 'M', 'T', 'B', 'C', 'H', 'J', 'Y', 'Z'];
        
        // Shuffle and pick unique names
        const shuffled = funcNames.sort(() => Math.random() - 0.5);
        const names = {
            main: shuffled[0],
            decode: shuffled[1],
            execute: shuffled[2],
            wrap: shuffled[3],
            check: shuffled[4],
            init: shuffled[5],
            run: shuffled[6],
            data: shuffled[7],
            key: shuffled[8],
            const: shuffled[9],
            env: shuffled[10] || 'E',
            bxor: shuffled[11] || 'X',
            load: shuffled[12] || 'L',
            err: shuffled[13] || 'r',
            result: shuffled[14] || 's',
            chunk: shuffled[15] || 'c',
            tbl: shuffled[16] || 't',
            idx: shuffled[17] || 'i',
            val: shuffled[18] || 'v',
            str: shuffled[19] || 'S',
            num: shuffled[20] || 'n',
        };

        // Add number suffixes to some names
        for (const key of Object.keys(names)) {
            if (Math.random() > 0.6) {
                names[key] = names[key] + Math.floor(Math.random() * 10);
            }
        }

        // Encryption key
        const encKey = Math.floor(Math.random() * 200) + 50;
        
        // Generate fake constant array (like Luraph's e={...})
        const fakeConsts = this.generateConstArray(9);
        
        // Encrypt source code
        const codeBytes = this.encryptStringToArray(sourceCode, encKey);
        
        // Generate obfuscated data representation (mix of formats)
        const dataStr = this.generateMixedDataArray(codeBytes);
        
        // Generate fake functions that look complex
        const fakeFuncs = this.generateFakeFunctions(names);
        
        // Build the professional output
        const output = this.buildProfessionalOutput(names, encKey, fakeConsts, dataStr, fakeFuncs);
        
        return output;
    }

    generateMixedDataArray(bytes) {
        const parts = [];
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            const format = Math.floor(Math.random() * 6);
            switch (format) {
                case 0:
                    parts.push(`0x${b.toString(16).toUpperCase()}`);
                    break;
                case 1:
                    parts.push(`0X${b.toString(16)}`);
                    break;
                case 2:
                    parts.push(`0b${b.toString(2)}`);
                    break;
                case 3:
                    parts.push(b.toString());
                    break;
                case 4:
                    parts.push(`0B${b.toString(2)}`);
                    break;
                default:
                    parts.push(`0x${b.toString(16)}`);
            }
        }
        return parts.join(',');
    }

    generateFakeFunctions(n) {
        const v1 = this.generateShortName();
        const v2 = this.generateShortName();
        const v3 = this.generateShortName();
        const v4 = this.generateShortName();
        
        const templates = [
            // Complex looking function 1
            `${n.check}=function(${v1},${v2},${v3},${v4})` +
            `(${v3})[${this.formatNumber(10)}]=${v1}.${n.data};` +
            `if not ${v4}[${this.formatNumber(30368)}] then ${v2}=${v1}:${n.decode}(${v4},${v2});` +
            `else ${v2}=${v1}:${n.run}(${v4},${v2});end;return ${v2};end`,
            
            // Constant array
            `${n.const}={${this.generateConstArray(9).map(x => this.formatNumber(x)).join(',')}}`,
            
            // Simple return function
            `${n.init}=function(${v1},${v1},${v2})${v2}=${v1}[${this.formatNumber(29370)}];return ${v2};end`,
            
            // Function with local
            `${n.wrap}=function(${v1},${v1},${v2},${v3})${v2}=(${this.formatNumber(30)});` +
            `${v1}[${this.formatNumber(33)}]=${v3};return ${v2};end`,
            
            // Complex math function
            `${n.execute}=function(${v1},${v2},${v3})` +
            `${v2}=${this.formatNumber(-3411915264)}+((${v1}.${n.bxor}((${v1}.${n.load}(${v1}.${n.const}[${this.formatNumber(2)}],` +
            `${v1}.${n.const}[${this.formatNumber(6)}]))+${v3}[${this.formatNumber(31479)}]))+${v1}.${n.const}[${this.formatNumber(8)}]);` +
            `${v3}[${this.formatNumber(23813)}]=(${v2});return ${v2};end`,
        ];
        
        return templates.join(',');
    }

    buildProfessionalOutput(n, key, fakeConsts, dataStr, fakeFuncs) {
        const v = {
            a: this.generateShortName(),
            b: this.generateShortName(),
            c: this.generateShortName(),
            d: this.generateShortName(),
            p: this.generateShortName(),
            r: this.generateShortName(),
            t: this.generateShortName(),
            i: this.generateShortName(),
            o: this.generateShortName(),
            x: this.generateShortName(),
        };

        return `--[[ Meson Obfuscator v4.0 | Professional VM | meson.dev ]]
return(function(...)
local ${n.env}=getfenv and getfenv()or _ENV or _G;
local ${n.bxor}=bit32 and bit32.bxor or bit and bit.bxor or function(${v.a},${v.b})
local ${v.p},${v.c}=1,0;
while ${v.a}>${this.formatNumber(0)} and ${v.b}>${this.formatNumber(0)} do
local ${v.r},${v.x}=${v.a}%${this.formatNumber(2)},${v.b}%${this.formatNumber(2)};
if ${v.r}~=${v.x} then ${v.c}=${v.c}+${v.p} end;
${v.a},${v.b},${v.p}=(${v.a}-${v.r})/${this.formatNumber(2)},(${v.b}-${v.x})/${this.formatNumber(2)},${v.p}*${this.formatNumber(2)};
end;
if ${v.a}<${v.b} then ${v.a}=${v.b} end;
while ${v.a}>${this.formatNumber(0)} do
local ${v.r}=${v.a}%${this.formatNumber(2)};
if ${v.r}>${this.formatNumber(0)} then ${v.c}=${v.c}+${v.p} end;
${v.a},${v.p}=(${v.a}-${v.r})/${this.formatNumber(2)},${v.p}*${this.formatNumber(2)};
end;
return ${v.c};end;
return({
${n.key}=${this.formatNumber(key)},
${n.const}={${fakeConsts.map(x => this.formatNumber(x)).join(',')}},
${fakeFuncs},
${n.data}={${dataStr}},
${n.decode}=function(${v.t})
local ${v.o}={};
local ${v.i}=${this.formatNumber(1)};
while ${v.i}<=#${v.t} do
${v.o}[${v.i}]=string.char(${n.bxor}(${v.t}[${v.i}],${this.formatNumber(key)}));
${v.i}=${v.i}+${this.formatNumber(1)};
end;
return table.concat(${v.o});
end,
${n.run}=function(${v.t})
local ${v.r}=${v.t}.${n.decode}(${v.t}.${n.data});
local ${v.c},${v.x}=(loadstring or load)(${v.r});
if not ${v.c} then error("Meson["..tostring(${v.x}).."]")end;
return ${v.c}(...);
end,
${n.main}=pcall,
${n.load}=string.sub,
${n.str}=string.byte,
${n.num}=string.char,
}):${n.run}()
end)(...)`;
    }

    encryptStringToArray(str, key) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ key);
        }
        return bytes;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encryptStrings(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const funcName = this.generateName('func');
        const keyVar = this.generateName('short');
        const eVar = this.generateName('short');
        const rVar = this.generateName('short');
        const iVar = this.generateName('short');
        
        const decoder = `local ${funcName};do local ${keyVar}=${this.formatNumber(this.stringKey)};${funcName}=function(${eVar})local ${rVar}=""for ${iVar}=1,#${eVar} do ${rVar}=${rVar}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(a,b)local p,c=1,0;while a>0 and b>0 do local ra,rb=a%2,b%2;if ra~=rb then c=c+p end;a,b,p=(a-ra)/2,(b-rb)/2,p*2 end;if a<b then a=b end;while a>0 do local ra=a%2;if ra>0 then c=c+p end;a,p=(a-ra)/2,p*2 end;return c end)(${eVar}[${iVar}],${keyVar}))end return ${rVar} end end;`;

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
        const funcName = this.generateName('func');
        const tableVar = this.generateName('short');
        const eVar = this.generateName('short');
        const kVar = this.generateName('short');
        const rVar = this.generateName('short');
        const iVar = this.generateName('short');
        const cVar = this.generateName('short');
        const xVar = this.generateName('short');
        
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
            const v = this.generateName('short');
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
        const checkVar = this.generateName('short');
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
        const stateVar = this.generateName('short');
        const funcVar = this.generateName('short');
        
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
