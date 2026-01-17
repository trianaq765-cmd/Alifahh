/**
 * Meson Obfuscator v4.1 - Luraph-Style Professional Output
 * Complex function tables, method calls, minimal number arrays
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
    
    // Single letter names like Luraph
    getSingleLetter() {
        const letters = 'vhQxrSmfKOMUTRBCDEFGHIJLNPWYZabcdegijklnopqstuwyz';
        for (const l of letters) {
            if (!this.usedNames.has(l)) {
                this.usedNames.add(l);
                return l;
            }
        }
        return '_' + Math.random().toString(36).substr(2, 2);
    }

    // Function-style names: w, e, f, Q2, R6, etc.
    getFuncName() {
        const styles = [
            () => this.getSingleLetter(),
            () => this.getSingleLetter() + Math.floor(Math.random() * 10),
            () => this.getSingleLetter().toUpperCase() + Math.floor(Math.random() * 10),
        ];
        return styles[Math.floor(Math.random() * styles.length)]();
    }

    generateName(style = 'single') {
        if (style === 'single') return this.getSingleLetter();
        if (style === 'func') return this.getFuncName();
        return this.getSingleLetter();
    }

    // Format numbers with Luraph-style variations
    formatNum(num) {
        if (num < 0) return `(-${this.formatNum(-num)})`;
        const formats = [
            () => `0x${num.toString(16).toUpperCase()}`,
            () => `0X${num.toString(16)}`,
            () => `0b${num.toString(2)}`,
            () => `0B${num.toString(2).replace(/(.{4})(?=.)/g, '$1_')}`,
            () => num > 1000 ? num.toString().replace(/\B(?=(\d{2})+(?!\d))/g, '_') : num.toString(),
            () => num.toString(),
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

    // ==================== BASIC/STANDARD/ADVANCED TIERS ====================

    applyBasicObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.minify(code);
        return `--[[ Meson v4.1 ]]\n` + code;
    }

    applyStandardObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.minify(code);
        return `--[[ Meson v4.1 ]]\n` + code;
    }

    applyAdvancedObfuscation(code) {
        code = this.removeComments(code);
        code = this.encryptStrings(code);
        code = this.encodeNumbers(code);
        code = this.renameVariables(code);
        code = this.wrapControlFlow(code);
        code = this.minify(code);
        return `--[[ Meson v4.1 ]]\n` + code;
    }

    // ==================== VM TIER - LURAPH STYLE ====================

    applyVMObfuscation(sourceCode) {
        this.reset();
        return this.generateLuraphStyleVM(sourceCode);
    }

    generateLuraphStyleVM(sourceCode) {
        // Generate all function/variable names first
        const n = {
            // Main structure names
            w: this.getFuncName(), e: this.getFuncName(), f: this.getFuncName(),
            Q: this.getFuncName(), R: this.getFuncName(), N: this.getFuncName(),
            I: this.getFuncName(), X: this.getFuncName(), n: this.getFuncName(),
            d: this.getFuncName(), u: this.getFuncName(), G: this.getFuncName(),
            a: this.getFuncName(), V: this.getFuncName(), U: this.getFuncName(),
            S: this.getFuncName(), P: this.getFuncName(), L: this.getFuncName(),
            z: this.getFuncName(), l: this.getFuncName(), g: this.getFuncName(),
            D: this.getFuncName(), K: this.getFuncName(), M: this.getFuncName(),
            T: this.getFuncName(), B: this.getFuncName(), C: this.getFuncName(),
            H: this.getFuncName(), J: this.getFuncName(), Y: this.getFuncName(),
            Z: this.getFuncName(), W: this.getFuncName(), O: this.getFuncName(),
            // Parameter names
            v: 'v', h: 'h', x: 'x', r: 'r', s: 's', m: 'm',
            o: 'o', p: 'p', c: 'c', k: 'k', t: 't', i: 'i',
        };

        // Encryption key
        const key = Math.floor(Math.random() * 200) + 50;
        
        // Generate random constants array (like Luraph's e={...})
        const constArr = Array(9).fill(0).map(() => Math.floor(Math.random() * 4294967295));
        
        // Process and encrypt source code
        const processedCode = this.removeComments(sourceCode);
        
        // Encode source as a more complex format (not just byte array)
        const encodedData = this.encodeSourceComplex(processedCode, key, n);
        
        // Generate fake complex functions
        const fakeFuncs = this.generateComplexFunctions(n, key);
        
        // Generate the real decoder/executor
        const realFuncs = this.generateRealFunctions(n, key);
        
        // Build final output
        return this.buildLuraphOutput(n, key, constArr, encodedData, fakeFuncs, realFuncs);
    }

    encodeSourceComplex(source, key, n) {
        // Split source into chunks and encode differently
        const chunks = [];
        const chunkSize = 50 + Math.floor(Math.random() * 50);
        
        for (let i = 0; i < source.length; i += chunkSize) {
            const chunk = source.substr(i, chunkSize);
            const encoded = [];
            for (let j = 0; j < chunk.length; j++) {
                encoded.push(chunk.charCodeAt(j) ^ key);
            }
            chunks.push(encoded);
        }
        
        return chunks;
    }

    generateComplexFunctions(n, key) {
        const funcs = [];
        
        // Function 1: Looks like a decoder with method calls
        funcs.push(`${n.w}=function(${n.v},${n.h},${n.Q},${n.x})` +
            `(${n.Q})[${this.formatNum(10)}]=${n.v}.${n.D};` +
            `if not ${n.x}[${this.formatNum(30368)}] then ` +
            `${n.h}=${n.v}:${n.l}(${n.x},${n.h});` +
            `else ${n.h}=${n.v}:${n.z}(${n.x},${n.h});end;` +
            `return ${n.h};end`);
        
        // Function 2: Simple return
        funcs.push(`${n.f}=function(${n.v},${n.v},${n.h})` +
            `${n.h}=${n.v}[${this.formatNum(29370)}];return ${n.h};end`);
        
        // Function 3: Assignment with return
        funcs.push(`${n.Q}2=function(${n.v},${n.v},${n.h},${n.Q})` +
            `${n.h}=(${this.formatNum(30)});` +
            `${n.v}[${this.formatNum(33)}]=${n.Q};return ${n.h};end`);
        
        // Function 4: Complex math
        funcs.push(`${n.R}=function(${n.v},${n.h},${n.Q})` +
            `${n.h}=${this.formatNum(-3411915264)}+((${n.v}.${n.P}2((${n.v}.${n.L}2(${n.v}.${n.e}[${this.formatNum(2)}],` +
            `${n.v}.${n.e}[${this.formatNum(6)}]))+${n.Q}[${this.formatNum(31479)}]))+${n.v}.${n.e}[${this.formatNum(8)}]);` +
            `${n.Q}[${this.formatNum(23813)}]=(${n.h});return ${n.h};end`);
        
        // Function 5: Table getter
        funcs.push(`${n.R}6=function(${n.v},${n.v},${n.h})` +
            `${n.h}=${n.v}[${this.formatNum(40)}]();return ${n.h};end`);
        
        // Function 6: Property getter
        funcs.push(`${n.N}=function(${n.v},${n.v},${n.h})` +
            `${n.h}=${n.v}[${this.formatNum(23813)}];return ${n.h};end`);
        
        // Function 7: Loop function
        funcs.push(`${n.J}6=function(${n.v},${n.h})` +
            `local ${n.Q},${n.x}=(${this.formatNum(15)});` +
            `repeat ${n.x},${n.Q}=${n.v}:${n.a}6(${n.h},${n.Q});` +
            `if ${n.x}==${this.formatNum(49299)} then break;` +
            `else if ${n.x}==-1 then return-1;end;end;until false;return nil;end`);
        
        // Function 8: Another getter
        funcs.push(`${n.n}6=function(${n.v},${n.v},${n.h})` +
            `${n.v}=${n.h}[${this.formatNum(23)}]();return ${n.v};end`);
        
        // Function 9: Complex conditional
        funcs.push(`${n.I}=function(${n.v},${n.h},${n.Q},${n.x})` +
            `local ${n.r};if ${n.x}<=${this.formatNum(70)} then ` +
            `if not(${n.x}>${this.formatNum(39)})then ${n.x}=${n.v}:${n.d}(${n.x},${n.h},${n.Q});` +
            `else if not(${n.x}<=${this.formatNum(67)})then ${n.x}=${n.v}:${n.P}(${n.h},${n.Q},${n.x});` +
            `return ${this.formatNum(36571)},${n.x};else(${n.h})[${this.formatNum(3)}]=${n.v}.${n.i};` +
            `if not(not ${n.Q}[${this.formatNum(7146)}])then ${n.x}=${n.Q}[${this.formatNum(7146)}];` +
            `else ${n.x}=${this.formatNum(-3272562488)}+((${n.v}.${n.L}2(${n.v}.${n.e}[${this.formatNum(9)}]>=${n.v}.${n.e}[${this.formatNum(4)}] ` +
            `and ${n.v}.${n.e}[${this.formatNum(9)}] or ${n.x}))-${n.v}.${n.e}[${this.formatNum(1)}]<=${n.v}.${n.e}[${this.formatNum(5)}] ` +
            `and ${n.v}.${n.e}[${this.formatNum(7)}] or ${n.Q}[${this.formatNum(31479)}]);` +
            `(${n.Q})[${this.formatNum(7146)}]=${n.x};end;end;end;` +
            `elseif ${n.x}<=${this.formatNum(104)} then if ${n.x}==${this.formatNum(90)} then ` +
            `${n.v}:${n.L}(${n.h});return ${this.formatNum(30334)},${n.x};` +
            `else ${n.h}[${this.formatNum(7)}]=(${this.formatNum(9007199254740992)});` +
            `if not ${n.Q}[${this.formatNum(18622)}] then ` +
            `${n.x}=(${this.formatNum(-504366492)}+(${n.v}.${n.S}2((${n.v}.${n.S}2(${n.Q}[${this.formatNum(6721)}]+${n.v}.${n.e}[${this.formatNum(8)}]-${n.v}.${n.e}[${this.formatNum(2)}])),${n.v}.${n.e}[${this.formatNum(8)}])));` +
            `(${n.Q})[${this.formatNum(18622)}]=(${n.x});else ${n.x}=${n.v}:${n.g}(${n.x},${n.Q});end;` +
            `return ${this.formatNum(36571)},${n.x};end;else ${n.r},${n.x}=${n.v}:${n.S}(${n.Q},${n.h},${n.x});` +
            `if ${n.r}==${this.formatNum(21363)} then return ${this.formatNum(36571)},${n.x};end;end;return nil,${n.x};end`);
        
        // Function 10: pcall wrapper
        funcs.push(`${n.X}=pcall`);
        
        // Function 11: string.pack
        funcs.push(`${n.w}2=string.pack`);
        
        // Function 12: bit rotate
        funcs.push(`${n.n}=bit32 and bit32.rrotate or function(${n.v},${n.h})return ${n.v} end`);
        
        return funcs.join(',');
    }

    generateRealFunctions(n, key) {
        // These are the actual working functions
        const decoder = `${n.O}2=function(${n.v})` +
            `local ${n.r}={};local ${n.t}=string.char;local ${n.k}=${this.formatNum(key)};` +
            `local ${n.x}=bit32 and bit32.bxor or bit and bit.bxor or function(${n.a},${n.b})` +
            `local ${n.p},${n.c}=1,0;while ${n.a}>0 and ${n.b}>0 do ` +
            `local ${n.m},${n.s}=${n.a}%2,${n.b}%2;if ${n.m}~=${n.s} then ${n.c}=${n.c}+${n.p} end;` +
            `${n.a},${n.b},${n.p}=(${n.a}-${n.m})/2,(${n.b}-${n.s})/2,${n.p}*2;end;` +
            `if ${n.a}<${n.b} then ${n.a}=${n.b} end;while ${n.a}>0 do local ${n.m}=${n.a}%2;` +
            `if ${n.m}>0 then ${n.c}=${n.c}+${n.p} end;${n.a},${n.p}=(${n.a}-${n.m})/2,${n.p}*2;end;return ${n.c};end;` +
            `for ${n.i}=1,#${n.v} do ${n.r}[${n.i}]=${n.t}(${n.x}(${n.v}[${n.i}],${n.k}));end;` +
            `return table.concat(${n.r});end`;
        
        return decoder;
    }

    buildLuraphOutput(n, key, constArr, encodedChunks, fakeFuncs, realFuncs) {
        // Build encoded data as named table entries instead of one big array
        const dataEntries = [];
        encodedChunks.forEach((chunk, idx) => {
            const name = this.getFuncName();
            // Mix up the format of numbers
            const formatted = chunk.map(b => this.formatNum(b)).join(',');
            dataEntries.push(`${name}={${formatted}}`);
        });
        
        // Create combined data getter
        const allChunkNames = encodedChunks.map((_, idx) => {
            return dataEntries[idx].split('=')[0];
        });
        
        // Build the main output in Luraph style
        const output = `--[[ Meson Obfuscator v4.1 | Professional | meson.dev ]]
return({${n.w}=function(${n.v},${n.h},${n.Q},${n.x})(${n.Q})[${this.formatNum(10)}]=${n.v}.${n.D};if not ${n.x}[${this.formatNum(30368)}] then ${n.h}=${n.v}:${n.l}(${n.x},${n.h});else ${n.h}=${n.v}:${n.z}(${n.x},${n.h});end;return ${n.h};end,${n.e}={${constArr.map(c => this.formatNum(c)).join(',')}},${n.f}=function(${n.v},${n.v},${n.h})${n.h}=${n.v}[${this.formatNum(29370)}];return ${n.h};end,${n.Q}2=function(${n.v},${n.v},${n.h},${n.Q})${n.h}=(${this.formatNum(30)});${n.v}[${this.formatNum(33)}]=${n.Q};return ${n.h};end,${n.R}=function(${n.v},${n.h},${n.Q})${n.h}=${this.formatNum(-3411915264)}+((${n.v}.${n.P}2((${n.v}.${n.L}2(${n.v}.${n.e}[${this.formatNum(2)}],${n.v}.${n.e}[${this.formatNum(6)}]))+${n.Q}[${this.formatNum(31479)}]))+${n.v}.${n.e}[${this.formatNum(8)}]);${n.Q}[${this.formatNum(23813)}]=(${n.h});return ${n.h};end,${n.R}6=function(${n.v},${n.v},${n.h})${n.h}=${n.v}[${this.formatNum(40)}]();return ${n.h};end,${n.N}=function(${n.v},${n.v},${n.h})${n.h}=${n.v}[${this.formatNum(23813)}];return ${n.h};end,${n.J}6=function(${n.v},${n.h})local ${n.Q},${n.x}=(${this.formatNum(15)});repeat ${n.x},${n.Q}=${n.v}:${n.a}6(${n.h},${n.Q});if ${n.x}==${this.formatNum(49299)} then break;else if ${n.x}==-1 then return-1;end;end;until false;return nil;end,${n.n}6=function(${n.v},${n.v},${n.h})${n.v}=${n.h}[${this.formatNum(23)}]();return ${n.v};end,${n.I}=function(${n.v},${n.h},${n.Q},${n.x})local ${n.r};if ${n.x}<=${this.formatNum(70)} then if not(${n.x}>${this.formatNum(39)})then ${n.x}=${n.v}:${n.d}(${n.x},${n.h},${n.Q});else if not(${n.x}<=${this.formatNum(67)})then ${n.x}=${n.v}:${n.P}(${n.h},${n.Q},${n.x});return ${this.formatNum(36571)},${n.x};else(${n.h})[${this.formatNum(3)}]=${n.v}.${n.i};if not(not ${n.Q}[${this.formatNum(7146)}])then ${n.x}=${n.Q}[${this.formatNum(7146)}];else ${n.x}=${this.formatNum(-3272562488)}+((${n.v}.${n.L}2(${n.v}.${n.e}[${this.formatNum(9)}]>=${n.v}.${n.e}[${this.formatNum(4)}] and ${n.v}.${n.e}[${this.formatNum(9)}] or ${n.x}))-${n.v}.${n.e}[${this.formatNum(1)}]<=${n.v}.${n.e}[${this.formatNum(5)}] and ${n.v}.${n.e}[${this.formatNum(7)}] or ${n.Q}[${this.formatNum(31479)}]);(${n.Q})[${this.formatNum(7146)}]=${n.x};end;end;end;elseif ${n.x}<=${this.formatNum(104)} then if ${n.x}==${this.formatNum(90)} then ${n.v}:${n.L}(${n.h});return ${this.formatNum(30334)},${n.x};else ${n.h}[${this.formatNum(7)}]=(${this.formatNum(9007199254740992)});if not ${n.Q}[${this.formatNum(18622)}] then ${n.x}=(${this.formatNum(-504366492)}+(${n.v}.${n.S}2((${n.v}.${n.S}2(${n.Q}[${this.formatNum(6721)}]+${n.v}.${n.e}[${this.formatNum(8)}]-${n.v}.${n.e}[${this.formatNum(2)}])),${n.v}.${n.e}[${this.formatNum(8)}])));(${n.Q})[${this.formatNum(18622)}]=(${n.x});else ${n.x}=${n.v}:${n.g}(${n.x},${n.Q});end;return ${this.formatNum(36571)},${n.x};end;else ${n.r},${n.x}=${n.v}:${n.S}(${n.Q},${n.h},${n.x});if ${n.r}==${this.formatNum(21363)} then return ${this.formatNum(36571)},${n.x};end;end;return nil,${n.x};end,${n.X}=pcall,${n.w}2=string.pack,${n.n}=bit32 and bit32.rrotate or function(${n.v},${n.h})return ${n.v} end,${this.generateMoreFakeFuncs(n)},${realFuncs},${n.Y}={${this.encodeSourceAsTableEntries(encodedChunks, n)}},${n.Z}=function(${n.s})local ${n.r}={};local ${n.t}=string.char;local ${n.k}=${this.formatNum(key)};local ${n.x}=bit32 and bit32.bxor or bit and bit.bxor or function(${n.a},${n.b})local ${n.p},${n.c}=1,0;while ${n.a}>0 and ${n.b}>0 do local ${n.m},${n.o}=${n.a}%2,${n.b}%2;if ${n.m}~=${n.o} then ${n.c}=${n.c}+${n.p} end;${n.a},${n.b},${n.p}=(${n.a}-${n.m})/2,(${n.b}-${n.o})/2,${n.p}*2;end;if ${n.a}<${n.b} then ${n.a}=${n.b} end;while ${n.a}>0 do local ${n.m}=${n.a}%2;if ${n.m}>0 then ${n.c}=${n.c}+${n.p} end;${n.a},${n.p}=(${n.a}-${n.m})/2,${n.p}*2;end;return ${n.c};end;for ${n.i}=1,#${n.s} do for ${n.j}=1,#${n.s}[${n.i}] do ${n.r}[#${n.r}+1]=${n.t}(${n.x}(${n.s}[${n.i}][${n.j}],${n.k}));end;end;return table.concat(${n.r});end,${n.W}=function(${n.t})local ${n.r}=${n.t}.${n.Z}(${n.t}.${n.Y});local ${n.c},${n.x}=(loadstring or load)(${n.r});if not ${n.c} then error("Meson["..tostring(${n.x}).."]");end;return ${n.c}(...);end}):${n.W}()`;
        
        return output;
    }

    generateMoreFakeFuncs(n) {
        const funcs = [];
        
        funcs.push(`${n.u}=function(${n.v},${n.h},${n.Q},${n.x})if ${n.x}==${this.formatNum(59)} then ${n.Q}[${this.formatNum(30)}]=(function(${n.r})${n.Q}[${this.formatNum(28)}]=(${n.r});${n.Q}[${this.formatNum(1)}]=${this.formatNum(1)};end);if not ${n.h}[${this.formatNum(15868)}] then ${n.x}=${n.v}:${n.n}(${n.x},${n.h});else ${n.x}=${n.h}[${this.formatNum(15868)}];end;else if ${n.x}~=${this.formatNum(94)} then else(${n.Q})[${this.formatNum(31)}]=select;return ${this.formatNum(59180)},${n.x};end;end;return nil,${n.x};end`);
        
        funcs.push(`${n.G}=function(${n.v},${n.h},${n.Q},${n.x})local ${n.r};${n.x}[${this.formatNum(28)}]=nil;${n.Q}=(${this.formatNum(112)});repeat ${n.r},${n.Q}=${n.v}:${n.j}(${n.h},${n.Q},${n.x});if ${n.r}==${this.formatNum(270048)} then break;end;until false;${n.x}[${this.formatNum(29)}]=type;return ${n.Q};end`);
        
        funcs.push(`${n.a}2=function(${n.v},${n.v})(${n.v})[${this.formatNum(32)}]={};end`);
        
        funcs.push(`${n.V}2=function(${n.v},${n.h},${n.Q},${n.x},${n.r},${n.S},${n.m})${n.Q}=(${this.formatNum(63)});while true do if ${n.Q}==${this.formatNum(63)} then ${n.x}[${this.formatNum(46)}]=(function()local ${n.f},${n.K},${n.O},${n.s},${n.T},${n.R};${n.T},${n.O},${n.R},${n.s}=${n.v}:${n.n}6(${n.s},${n.T},${n.O},${n.x},${n.R});local ${n.M},${n.U};${n.M},${n.U},${n.T},${n.R}=${n.v}:${n.p}6(${n.T},${n.O},${n.x},${n.R},${n.M},${n.s},${n.U});return ${n.K};end);if not(not ${n.r}[${this.formatNum(1587)}])then ${n.Q}=${n.v}:${n.D}2(${n.Q});else ${n.Q}=${this.formatNum(98)};end;else break;end;end;return ${n.x};end`);
        
        funcs.push(`${n.d}2=string.sub`);
        
        funcs.push(`${n.U}2=function(${n.v},${n.v},${n.h})${n.h}=${n.v}[${this.formatNum(36)}]();return ${n.h};end`);
        
        return funcs.join(',');
    }

    encodeSourceAsTableEntries(chunks, n) {
        const entries = [];
        chunks.forEach((chunk, idx) => {
            const formatted = chunk.map(b => this.formatNum(b)).join(',');
            entries.push(`{${formatted}}`);
        });
        return entries.join(',');
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encryptStrings(code) {
        this.stringKey = Math.floor(Math.random() * 200) + 50;
        const funcName = this.getFuncName();
        const k = this.getSingleLetter();
        const e = this.getSingleLetter();
        const r = this.getSingleLetter();
        const i = this.getSingleLetter();
        
        const decoder = `local ${funcName};do local ${k}=${this.formatNum(this.stringKey)};${funcName}=function(${e})local ${r}=""for ${i}=1,#${e} do ${r}=${r}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(a,b)local p,c=1,0;while a>0 and b>0 do local m,n=a%2,b%2;if m~=n then c=c+p end;a,b,p=(a-m)/2,(b-n)/2,p*2 end;if a<b then a=b end;while a>0 do local m=a%2;if m>0 then c=c+p end;a,p=(a-m)/2,p*2 end;return c end)(${e}[${i}],${k}))end return ${r} end end;`;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        let result = code.replace(stringPattern, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 2 || content.includes('\\')) return match;
            
            const encrypted = [];
            for (let j = 0; j < content.length; j++) {
                encrypted.push(content.charCodeAt(j) ^ this.stringKey);
            }
            return `${funcName}({${encrypted.map(b => this.formatNum(b)).join(',')}})`;
        });

        return decoder + result;
    }

    encodeNumbers(code) {
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxXbB])/g;
        return code.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            if (n < 2 || n > 99999 || Math.random() > 0.5) return match;
            return this.formatNum(n);
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
                renames.set(varName, this.getSingleLetter());
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    wrapControlFlow(code) {
        const s = this.getSingleLetter();
        const f = this.getSingleLetter();
        return `local ${s}=1;local ${f}={[1]=function()${code};${s}=0 end};while ${s}>0 do if ${f}[${s}]then ${f}[${s}]()end end;`;
    }

    minify(code) {
        let result = code.split('\n').map(l => l.trim()).filter(l => l).join(' ');
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
