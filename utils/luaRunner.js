/**
 * Meson Obfuscator v6.0 - Stable & Professional
 * Based on working v3.1 + improved output formatting
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
            O0o: () => {
                let name = '';
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
                const all = ['single', 'withNum', 'Il1', 'O0o'];
                return styles[all[Math.floor(Math.random() * all.length)]]();
            }
        };
        
        return styles[style] ? styles[style]() : styles.mixed();
    }

    // Format number with variety (hex, binary, decimal, underscore)
    formatNumber(num) {
        if (num < 0) return '(-' + this.formatNumber(-num) + ')';
        
        const r = Math.random();
        if (r < 0.20) return '0x' + num.toString(16).toUpperCase();
        if (r < 0.35) return '0X' + num.toString(16);
        if (r < 0.45 && num < 256) return '0b' + num.toString(2);
        if (r < 0.55 && num < 256) return '0B' + num.toString(2);
        if (r < 0.65 && num > 1000) {
            return num.toString().replace(/\B(?=(\d{2})+(?!\d))/g, '_');
        }
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

    // ==================== TIER IMPLEMENTATIONS ====================

    applyBasicObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.minify(code);
        return '--[[Meson v6.0]]\n' + code;
    }

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.addDeadCode(code);
        code = this.minify(code);
        return '--[[Meson v6.0]]\n' + code;
    }

    applyAdvancedObfuscation(code) {
        code = this.removeComments(code);
        code = this.addDeadCode(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.addOpaquePredicates(code);
        code = this.renameVariables(code);
        code = this.wrapControlFlow(code);
        code = this.minify(code);
        return '--[[Meson v6.0]]\n' + code;
    }

    applyVMObfuscation(sourceCode) {
        this.reset();
        const code = this.removeComments(sourceCode);
        return this.buildVM(code);
    }

    // ==================== VM BUILDER (TESTED & WORKING) ====================

    buildVM(sourceCode) {
        // Generate unique short variable names
        const v = {
            xor: this.generateVarName('single'),
            key: this.generateVarName('single'),
            data: this.generateVarName('single'),
            decode: this.generateVarName('single'),
            result: this.generateVarName('single'),
            chunk: this.generateVarName('single'),
            err: this.generateVarName('single'),
            char: this.generateVarName('single'),
            concat: this.generateVarName('single'),
            i: this.generateVarName('single'),
            a: this.generateVarName('single'),
            b: this.generateVarName('single'),
            p: this.generateVarName('single'),
            c: this.generateVarName('single'),
            m: this.generateVarName('single'),
            n: this.generateVarName('single'),
            r: this.generateVarName('single'),
            t: this.generateVarName('single'),
        };

        // Encryption key
        const key = Math.floor(Math.random() * 200) + 50;

        // Encrypt source code
        const encrypted = [];
        for (let i = 0; i < sourceCode.length; i++) {
            encrypted.push(sourceCode.charCodeAt(i) ^ key);
        }

        // Format encrypted data with mixed number formats
        const formattedData = encrypted.map(b => this.formatNumber(b)).join(',');

        // Build the VM code
        const vmCode = `--[[Meson v6.0|VM Protected]]
return(function(...)
local ${v.char}=string.char
local ${v.concat}=table.concat
local ${v.xor}=bit32 and bit32.bxor or bit and bit.bxor or function(${v.a},${v.b})
local ${v.p},${v.c}=1,0
while ${v.a}>0 and ${v.b}>0 do
local ${v.m},${v.n}=${v.a}%2,${v.b}%2
if ${v.m}~=${v.n} then ${v.c}=${v.c}+${v.p} end
${v.a},${v.b},${v.p}=(${v.a}-${v.m})/2,(${v.b}-${v.n})/2,${v.p}*2
end
if ${v.a}<${v.b} then ${v.a}=${v.b} end
while ${v.a}>0 do
local ${v.m}=${v.a}%2
if ${v.m}>0 then ${v.c}=${v.c}+${v.p} end
${v.a},${v.p}=(${v.a}-${v.m})/2,${v.p}*2
end
return ${v.c}
end
local ${v.key}=${this.formatNumber(key)}
local ${v.data}={${formattedData}}
local ${v.decode}=function()
local ${v.r}={}
for ${v.i}=1,#${v.data} do
${v.r}[${v.i}]=${v.char}(${v.xor}(${v.data}[${v.i}],${v.key}))
end
return ${v.concat}(${v.r})
end
local ${v.result}=${v.decode}()
local ${v.chunk},${v.err}=(loadstring or load)(${v.result})
if not ${v.chunk} then
error("Meson:"..tostring(${v.err}))
end
return ${v.chunk}(...)
end)(...)`;

        return this.minify(vmCode);
    }

    // ==================== STRING ENCRYPTION ====================

    encryptStrings(code) {
        const key = Math.floor(Math.random() * 200) + 50;
        const funcName = this.generateVarName('withNum');
        const keyVar = this.generateVarName('single');
        const tblVar = this.generateVarName('single');
        const resVar = this.generateVarName('single');
        const iVar = this.generateVarName('single');
        const aVar = this.generateVarName('single');
        const bVar = this.generateVarName('single');
        const pVar = this.generateVarName('single');
        const cVar = this.generateVarName('single');
        const mVar = this.generateVarName('single');
        const nVar = this.generateVarName('single');

        const decoder = `local ${funcName};do local ${keyVar}=${this.formatNumber(key)};${funcName}=function(${tblVar})local ${resVar}=""for ${iVar}=1,#${tblVar} do ${resVar}=${resVar}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(${aVar},${bVar})local ${pVar},${cVar}=1,0 while ${aVar}>0 and ${bVar}>0 do local ${mVar},${nVar}=${aVar}%2,${bVar}%2 if ${mVar}~=${nVar} then ${cVar}=${cVar}+${pVar} end ${aVar},${bVar},${pVar}=(${aVar}-${mVar})/2,(${bVar}-${nVar})/2,${pVar}*2 end if ${aVar}<${bVar} then ${aVar}=${bVar} end while ${aVar}>0 do local ${mVar}=${aVar}%2 if ${mVar}>0 then ${cVar}=${cVar}+${pVar} end ${aVar},${pVar}=(${aVar}-${mVar})/2,${pVar}*2 end return ${cVar} end)(${tblVar}[${iVar}],${keyVar}))end return ${resVar} end end;`;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;

        const result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 2 || content.includes('\\')) return match;

            const encrypted = [];
            for (let i = 0; i < content.length; i++) {
                encrypted.push(content.charCodeAt(i) ^ key);
            }
            return funcName + '({' + encrypted.map(b => this.formatNumber(b)).join(',') + '})';
        });

        return decoder + result;
    }

    // ==================== NUMBER ENCODING ====================

    encodeNumbers(code) {
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxXbB])/g;

        return code.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            if (n < 2 || n > 99999 || Math.random() > 0.5) return match;

            const methods = [
                () => {
                    const a = Math.floor(Math.random() * 500);
                    return '(' + this.formatNumber(a) + '+' + this.formatNumber(n - a) + ')';
                },
                () => {
                    const a = n + Math.floor(Math.random() * 500);
                    return '(' + this.formatNumber(a) + '-' + this.formatNumber(a - n) + ')';
                },
                () => this.formatNumber(n)
            ];

            return methods[Math.floor(Math.random() * methods.length)]();
        });
    }

    // ==================== VARIABLE RENAMING ====================

    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

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
                if (!protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateVarName());
                }
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp('\\b' + oldName + '\\b', 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    // ==================== DEAD CODE ====================

    addDeadCode(code) {
        const snippets = [];
        const count = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < count; i++) {
            const v = this.generateVarName();
            const type = Math.floor(Math.random() * 5);

            switch (type) {
                case 0:
                    snippets.push('local ' + v + '=' + this.formatNumber(Math.floor(Math.random() * 10000)) + ';');
                    break;
                case 1:
                    snippets.push('local ' + v + '=function()return nil end;');
                    break;
                case 2:
                    const a = Math.floor(Math.random() * 100) + 100;
                    snippets.push('if ' + this.formatNumber(a) + '>' + this.formatNumber(a + 50) + ' then local ' + v + '=nil end;');
                    break;
                case 3:
                    snippets.push('local ' + v + '={};');
                    break;
                case 4:
                    snippets.push('local ' + v + '=string.rep("",0);');
                    break;
            }
        }

        return snippets.join('') + code;
    }

    // ==================== OPAQUE PREDICATES ====================

    addOpaquePredicates(code) {
        const checkVar = this.generateVarName();
        const predicates = [
            '(' + this.formatNumber(Math.floor(Math.random() * 100) + 1) + '*' + this.formatNumber(Math.floor(Math.random() * 100) + 1) + '>=' + this.formatNumber(1) + ')',
            '(type("")=="string")',
            '(type({})=="table")',
            '(#""==' + this.formatNumber(0) + ')'
        ];

        const pred = predicates[Math.floor(Math.random() * predicates.length)];
        return 'local ' + checkVar + '=' + pred + ';if not ' + checkVar + ' then return end;' + code;
    }

    // ==================== CONTROL FLOW ====================

    wrapControlFlow(code) {
        const stateVar = this.generateVarName();
        const funcVar = this.generateVarName();

        return 'local ' + stateVar + '=' + this.formatNumber(1) + ';local ' + funcVar + '={[' + this.formatNumber(1) + ']=function()' + code + ';' + stateVar + '=' + this.formatNumber(0) + ' end};while ' + stateVar + '>' + this.formatNumber(0) + ' do if ' + funcVar + '[' + stateVar + '] then ' + funcVar + '[' + stateVar + ']() end end;';
    }

    // ==================== UTILITIES ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    minify(code) {
        let result = code;
        // Remove empty lines
        result = result.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
        // Collapse newlines to space
        result = result.replace(/\n/g, ' ');
        // Collapse multiple spaces
        result = result.replace(/\s+/g, ' ');
        // Remove spaces around certain operators
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');
        // Ensure spaces around keywords
        result = result.replace(/\b(and|or|not|then|do|end|else|elseif|in|local|function|return|if|while|for|repeat|until)\b/g, ' $1 ');
        // Clean up multiple spaces
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
