/**
 * Meson Obfuscator v5.0 - Professional Luraph-Style
 * Mixed encoding: strings, numbers, symbols - NOT just numbers!
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

    // Single letter names like Luraph
    getVar() {
        const letters = 'vhQxrSmfKOMUTRBCDEFGHIJLNPWYZabcdegijklnopqstuwyz';
        for (const l of letters) {
            if (!this.usedNames.has(l)) {
                this.usedNames.add(l);
                return l;
            }
        }
        return '_' + (this.varCounter++);
    }

    // Format numbers with variety
    fmtNum(num) {
        if (num < 0) return `(-${this.fmtNum(-num)})`;
        const r = Math.random();
        if (r < 0.2) return `0x${num.toString(16).toUpperCase()}`;
        if (r < 0.4) return `0X${num.toString(16)}`;
        if (r < 0.5 && num < 256) return `0b${num.toString(2)}`;
        if (r < 0.6 && num < 256) return `0B${num.toString(2)}`;
        return num.toString();
    }

    // Generate random looking string (like Luraph's middle section)
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    // Encode string to Base91-like format (like Luraph)
    encodeToBase91(str) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~';
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            result += chars[code % chars.length];
            result += chars[Math.floor(code / chars.length) % chars.length];
        }
        return result;
    }

    // Main entry
    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let output;

            switch (tier) {
                case 'basic':
                    output = this.basicTier(sourceCode);
                    break;
                case 'standard':
                    output = this.standardTier(sourceCode);
                    break;
                case 'advanced':
                    output = this.advancedTier(sourceCode);
                    break;
                case 'vm':
                case 'ultimate':
                    output = this.vmTier(sourceCode);
                    break;
                default:
                    output = this.basicTier(sourceCode);
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
    basicTier(code) {
        code = this.removeComments(code);
        code = this.encryptStringsSimple(code);
        return `--[[ Meson v5.0 ]]\n` + this.minify(code);
    }

    // ==================== STANDARD TIER ====================
    standardTier(code) {
        code = this.removeComments(code);
        code = this.encryptStringsSimple(code);
        code = this.renameVars(code);
        return `--[[ Meson v5.0 ]]\n` + this.minify(code);
    }

    // ==================== ADVANCED TIER ====================
    advancedTier(code) {
        code = this.removeComments(code);
        code = this.encryptStringsSimple(code);
        code = this.renameVars(code);
        code = this.wrapCode(code);
        return `--[[ Meson v5.0 ]]\n` + this.minify(code);
    }

    // ==================== VM TIER - LURAPH STYLE ====================
    vmTier(sourceCode) {
        this.reset();
        const code = this.removeComments(sourceCode);
        return this.buildLuraphStyle(code);
    }

    buildLuraphStyle(sourceCode) {
        // Get short variable names
        const v = this.getVar();
        const h = this.getVar();
        const Q = this.getVar();
        const x = this.getVar();
        const r = this.getVar();
        const S = this.getVar();
        const m = this.getVar();
        const f = this.getVar();
        const K = this.getVar();
        const O = this.getVar();
        const s = this.getVar();
        const T = this.getVar();
        const M = this.getVar();
        const U = this.getVar();
        const e = this.getVar();
        const n = this.getVar();
        const w = this.getVar();
        const d = this.getVar();
        const I = this.getVar();
        const G = this.getVar();
        const a = this.getVar();
        const N = this.getVar();
        const P = this.getVar();
        const L = this.getVar();
        const z = this.getVar();
        const l = this.getVar();
        const g = this.getVar();
        const D = this.getVar();
        const B = this.getVar();
        const C = this.getVar();
        const Y = this.getVar();
        const Z = this.getVar();
        const W = this.getVar();
        const J = this.getVar();
        
        // Encryption key
        const key = Math.floor(Math.random() * 200) + 50;
        
        // Encode source to Base91-like string (like Luraph's middle section)
        const encodedSource = this.encodeToBase91(sourceCode);
        
        // Split encoded source into chunks for variety
        const chunkSize = 60;
        const chunks = [];
        for (let i = 0; i < encodedSource.length; i += chunkSize) {
            chunks.push(encodedSource.substr(i, chunkSize));
        }
        
        // Generate random constants array
        const constArr = Array(9).fill(0).map(() => Math.floor(Math.random() * 4294967295));
        
        // Build the output
        const output = `--[[ Meson Obfuscator v5.0 | https://meson.dev ]]
return(function(...)
local ${e}={${constArr.map(c => this.fmtNum(c)).join(',')}};
local ${w}=function(${v},${h},${Q},${x})(${Q})[${this.fmtNum(10)}]=${v}.${D};if not ${x}[${this.fmtNum(30368)}] then ${h}=${v}:${l}(${x},${h});else ${h}=${v}:${z}(${x},${h});end;return ${h};end;
local ${f}=function(${v},${v},${h})${h}=${v}[${this.fmtNum(29370)}];return ${h};end;
local ${Q}2=function(${v},${v},${h},${Q})${h}=(${this.fmtNum(30)});${v}[${this.fmtNum(33)}]=${Q};return ${h};end;
local ${N}=function(${v},${h},${Q})${h}=${this.fmtNum(-3411915264)}+((${v}.${P}2((${v}.${L}2(${v}.${e}[${this.fmtNum(2)}],${v}.${e}[${this.fmtNum(6)}]))+${Q}[${this.fmtNum(31479)}]))+${v}.${e}[${this.fmtNum(8)}]);${Q}[${this.fmtNum(23813)}]=(${h});return ${h};end;
local ${N}6=function(${v},${v},${h})${h}=${v}[${this.fmtNum(40)}]();return ${h};end;
local ${I}=function(${v},${v},${h})${h}=${v}[${this.fmtNum(23813)}];return ${h};end;
local ${J}6=function(${v},${h})local ${Q},${x}=(${this.fmtNum(15)});repeat ${x},${Q}=${v}:${a}6(${h},${Q});if ${x}==${this.fmtNum(49299)} then break;else if ${x}==-1 then return-1;end;end;until false;return nil;end;
local ${n}6=function(${v},${v},${h})${v}=${h}[${this.fmtNum(23)}]();return ${v};end;
local ${G}=function(${v},${h},${Q},${x})local ${r};if ${x}<=${this.fmtNum(70)} then if not(${x}>${this.fmtNum(39)})then ${x}=${v}:${d}(${x},${h},${Q});else if not(${x}<=${this.fmtNum(67)})then ${x}=${v}:${P}(${h},${Q},${x});return ${this.fmtNum(36571)},${x};else(${h})[${this.fmtNum(3)}]=${v}.${g};if not(not ${Q}[${this.fmtNum(7146)}])then ${x}=${Q}[${this.fmtNum(7146)}];else ${x}=${this.fmtNum(-3272562488)}+((${v}.${L}2(${v}.${e}[${this.fmtNum(9)}]>=${v}.${e}[${this.fmtNum(4)}] and ${v}.${e}[${this.fmtNum(9)}] or ${x}))-${v}.${e}[${this.fmtNum(1)}]<=${v}.${e}[${this.fmtNum(5)}] and ${v}.${e}[${this.fmtNum(7)}] or ${Q}[${this.fmtNum(31479)}]);(${Q})[${this.fmtNum(7146)}]=${x};end;end;end;return nil,${x};end;
local ${B}=pcall;
local ${w}2=string.pack or function()end;
local ${n}=bit32 and bit32.rrotate or function(${v})return ${v} end;
local ${d}2=string.sub;
local ${a}2=function(${v},${v})(${v})[${this.fmtNum(32)}]={};end;
local ${U}2=function(${v},${v},${h})${h}=${v}[${this.fmtNum(36)}]();return ${h};end;
local ${C}="${chunks.join(`";
local ${Y}="`)}";
local ${Z}=function()
local ${s}=${C}..${Y};
local ${r}="";
local ${T}="${'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~'}";
local ${m}=#${T};
for ${K}=1,#${s},2 do
local ${O}=string.find(${T},string.sub(${s},${K},${K}),1,true)or 1;
local ${M}=string.find(${T},string.sub(${s},${K}+1,${K}+1),1,true)or 1;
${r}=${r}..string.char(((${M}-1)*${m}+(${O}-1))%256);
end;
return ${r};
end;
local ${W}=${Z}();
local ${J},${x}=(loadstring or load)(${W});
if not ${J} then 
error("Meson: "..(${x} or "Unknown error"));
end;
return ${J}(...);
end)(...)`;

        return output;
    }

    // ==================== HELPER METHODS ====================

    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encryptStringsSimple(code) {
        const key = Math.floor(Math.random() * 200) + 50;
        const fn = this.getVar();
        const k = this.getVar();
        const t = this.getVar();
        const r = this.getVar();
        const i = this.getVar();

        const decoder = `local ${fn};do local ${k}=${key};${fn}=function(${t})local ${r}=""for ${i}=1,#${t} do ${r}=${r}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(a,b)local p,c=1,0 while a>0 and b>0 do local m,n=a%2,b%2 if m~=n then c=c+p end a,b,p=(a-m)/2,(b-n)/2,p*2 end if a<b then a=b end while a>0 do local m=a%2 if m>0 then c=c+p end a,p=(a-m)/2,p*2 end return c end)(${t}[${i}],${k}))end return ${r} end end;`;

        const result = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, (match) => {
            const content = match.slice(1, -1);
            if (content.length < 2 || content.includes('\\')) return match;
            const enc = [];
            for (let j = 0; j < content.length; j++) {
                enc.push(content.charCodeAt(j) ^ key);
            }
            return `${fn}({${enc.map(b => this.fmtNum(b)).join(',')}})`;
        });

        return decoder + result;
    }

    renameVars(code) {
        const reserved = new Set(['and','break','do','else','elseif','end','false','for','function','goto','if','in','local','nil','not','or','repeat','return','then','true','until','while','print','warn','error','assert','type','typeof','pairs','ipairs','next','select','unpack','pcall','xpcall','tonumber','tostring','rawget','rawset','setmetatable','getmetatable','require','loadstring','load','string','table','math','bit32','bit','coroutine','debug','os','io','game','workspace','script','shared','tick','time','wait','delay','spawn','task','getfenv','setfenv','getgenv','getrenv','Instance','Vector2','Vector3','CFrame','Color3','BrickColor','UDim','UDim2','Ray','Region3','TweenInfo','Enum','self','_G','_VERSION','_ENV']);
        const renames = new Map();

        let match;
        const pattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        while ((match = pattern.exec(code)) !== null) {
            const name = match[1];
            if (!reserved.has(name) && !renames.has(name)) {
                renames.set(name, this.getVar());
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            result = result.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
        });
        return result;
    }

    wrapCode(code) {
        const s = this.getVar();
        const f = this.getVar();
        return `local ${s}=1;local ${f}={[1]=function()${code};${s}=0 end};while ${s}>0 do if ${f}[${s}]then ${f}[${s}]()end end`;
    }

    minify(code) {
        return code.split('\n').map(l => l.trim()).filter(l => l).join(' ').replace(/\s+/g, ' ').replace(/\s*([{}()\[\],;])\s*/g, '$1').trim();
    }
}

module.exports = new MesonObfuscator();
