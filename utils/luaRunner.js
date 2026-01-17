/**
 * Meson Obfuscator v3.0 - All-in-One VM-Based Obfuscator
 * Complete solution with built-in VM generator
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
        return `--[[ Meson Obfuscator v3.0 | meson.dev ]]\n` + code;
    }

    // ==================== STANDARD TIER ====================

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.addDeadCode(code);
        code = this.minify(code);
        return `--[[ Meson Obfuscator v3.0 | meson.dev ]]\n` + code;
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
        return `--[[ Meson Obfuscator v3.0 | meson.dev ]]\n` + code;
    }

    // ==================== VM TIER ====================

    applyVMObfuscation(sourceCode) {
        // Step 1: Parse and prepare the code
        const preparedCode = this.removeComments(sourceCode);
        
        // Step 2: Generate VM structure
        const vmCode = this.generateVMStructure(preparedCode);
        
        return vmCode;
    }

    generateVMStructure(sourceCode) {
        // Variable names for VM components
        const v = {
            main: this.generateName(),
            strtbl: this.generateName(),
            decode: this.generateName(),
            key: this.generateName(),
            env: this.generateName(),
            wrap: this.generateName(),
            exec: this.generateName(),
            stack: this.generateName(),
            inst: this.generateName(),
            const: this.generateName(),
            func: this.generateName(),
            pcall: this.generateName(),
            err: this.generateName(),
            result: this.generateName(),
            args: this.generateName(),
            idx: this.generateName(),
            val: this.generateName(),
            tbl: this.generateName(),
            chr: this.generateName(),
            bxor: this.generateName(),
            sub: this.generateName(),
            byte: this.generateName(),
            char: this.generateName(),
            concat: this.generateName(),
            select: this.generateName(),
            unpack: this.generateName(),
            pack: this.generateName(),
            type: this.generateName(),
            next: this.generateName(),
            pairs: this.generateName(),
            getfenv: this.generateName(),
            setfenv: this.generateName(),
            tonumber: this.generateName(),
            tostring: this.generateName(),
            rawget: this.generateName(),
            rawset: this.generateName(),
            setmeta: this.generateName(),
            getmeta: this.generateName(),
            bit: this.generateName(),
        };

        // Encryption key
        const encKey = Math.floor(Math.random() * 200) + 50;

        // Encrypt all strings in the source code
        const strings = this.extractStrings(sourceCode);
        const encryptedStrings = strings.map(s => this.encryptStringToArray(s, encKey));
        
        // Build string table
        let stringTableCode = `local ${v.strtbl}={`;
        encryptedStrings.forEach((enc, i) => {
            stringTableCode += `[${this.formatNumber(i)}]={${enc.map(b => this.formatNumber(b)).join(',')}},`;
        });
        stringTableCode += `};`;

        // Replace strings in source with table lookups
        let processedCode = sourceCode;
        strings.forEach((str, i) => {
            const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(["'])${escaped}\\1`, 'g');
            processedCode = processedCode.replace(regex, `${v.decode}(${v.strtbl}[${this.formatNumber(i)}])`);
        });

        // Encrypt the processed code itself
        const codeBytes = this.encryptStringToArray(processedCode, encKey);
        
        // Generate the complete VM output
        const output = `--[[ Meson Obfuscator v3.0 | VM Protected | meson.dev ]]
return(function(...)
local ${v.key}=${this.formatNumber(encKey)};
local ${v.byte}=string.byte;
local ${v.char}=string.char;
local ${v.sub}=string.sub;
local ${v.concat}=table.concat;
local ${v.select}=select;
local ${v.unpack}=unpack or table.unpack;
local ${v.pack}=table.pack or function(...)return{n=${v.select}("#",...),}end;
local ${v.type}=type;
local ${v.next}=next;
local ${v.pairs}=pairs;
local ${v.tonumber}=tonumber;
local ${v.tostring}=tostring;
local ${v.getfenv}=getfenv;
local ${v.setmeta}=setmetatable;
local ${v.getmeta}=getmetatable;
local ${v.rawget}=rawget;
local ${v.rawset}=rawset;
local ${v.pcall}=pcall;
local ${v.bit}=bit32 or bit or{bxor=function(${v.args},b)local p,c=1,0;while ${v.args}>0 and b>0 do local ra,rb=${v.args}%2,b%2;if ra~=rb then c=c+p end;${v.args},b,p=(${v.args}-ra)/2,(b-rb)/2,p*2 end;if ${v.args}<b then ${v.args}=b end;while ${v.args}>0 do local ra=${v.args}%2;if ra>0 then c=c+p end;${v.args},p=(${v.args}-ra)/2,p*2 end;return c end};
local ${v.bxor}=${v.bit}.bxor;
local ${v.env}=${v.getfenv} and ${v.getfenv}()or _ENV or _G;
local ${v.decode}=function(${v.tbl})
local ${v.result}=""
for ${v.idx}=1,#${v.tbl} do
${v.result}=${v.result}..${v.char}(${v.bxor}(${v.tbl}[${v.idx}],${v.key}))
end
return ${v.result}
end;
${stringTableCode}
local ${v.inst}={${codeBytes.map(b => this.formatNumber(b)).join(',')}};
local ${v.func}=${v.decode}(${v.inst});
local ${v.exec},${v.err}=loadstring(${v.func});
if not ${v.exec} then
${v.exec},${v.err}=load(${v.func});
end;
if ${v.exec} then
${v.setmeta}(${v.env},{__index=_G});
if ${v.setfenv} then ${v.setfenv}(${v.exec},${v.env})end;
return ${v.exec}(...);
else
error(${v.decode}({${this.encryptStringToArray("Meson VM Error: ", encKey).join(',')}})..${v.tostring}(${v.err}));
end;
end)(...)`;

        return this.minify(output);
    }

    extractStrings(code) {
        const strings = [];
        const regex = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        let match;
        
        while ((match = regex.exec(code)) !== null) {
            const content = match[0].slice(1, -1);
            if (content.length >= 2 && !content.includes('\\') && !strings.includes(content)) {
                strings.push(content);
            }
        }
        
        return strings;
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
        // Remove multi-line comments
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        // Remove single-line comments
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encryptStrings(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const funcName = this.generateName();
        const keyVar = this.generateName();
        
        const decoder = `local ${funcName};do local ${keyVar}=${this.formatNumber(this.stringKey)};${funcName}=function(e)local r=""for i=1,#e do r=r..string.char((bit32 and bit32.bxor or function(a,b)local p,c=1,0;while a>0 and b>0 do local ra,rb=a%2,b%2;if ra~=rb then c=c+p end;a,b,p=(a-ra)/2,(b-rb)/2,p*2 end;if a<b then a=b end;while a>0 do local ra=a%2;if ra>0 then c=c+p end;a,p=(a-ra)/2,p*2 end;return c end)(e[i],${keyVar}))end return r end end;`;

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
        
        const decoder = `local ${funcName};do local ${tableVar}={};for i=0,255 do ${tableVar}[i]=string.char(i)end;${funcName}=function(e,k)local r=""for i=1,#e do local c=e[i]local x=(bit32 and bit32.bxor(c,k)or c)r=r..(${tableVar}[x]or string.char(x))end return r end end;`;

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
        // Remove extra whitespace but preserve newlines in strings
        result = result.split('\n').map(line => line.trim()).filter(line => line).join(' ');
        result = result.replace(/\s+/g, ' ');
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');
        // Ensure spaces around keywords
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
