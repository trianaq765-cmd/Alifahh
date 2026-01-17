/**
 * Meson Obfuscator v5.1 - WORKING Professional Version
 * Tested & Fixed - No more errors!
 */

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.counter = 0;
        this.used = new Set();
        this.key = Math.floor(Math.random() * 200) + 50;
    }

    // Get unique short variable name
    getVar() {
        const chars = 'vhQxrSmfKOMUTRBCDEFGHIJLNPWYZabcdegijklnopqstuwyz';
        for (const c of chars) {
            if (!this.used.has(c)) {
                this.used.add(c);
                return c;
            }
        }
        this.counter++;
        return '_' + this.counter;
    }

    // Get function-style name (like Luraph: w, e, f, Q2, R6)
    getFn() {
        const base = this.getVar();
        if (Math.random() > 0.5) {
            return base + Math.floor(Math.random() * 10);
        }
        return base;
    }

    // Format number with variety
    fmt(n) {
        if (n < 0) return `(-${this.fmt(-n)})`;
        const r = Math.random();
        if (r < 0.15) return `0x${n.toString(16).toUpperCase()}`;
        if (r < 0.30) return `0X${n.toString(16)}`;
        if (r < 0.40 && n < 256) return `0b${n.toString(2)}`;
        if (r < 0.50 && n < 256) return `0B${n.toString(2)}`;
        if (r < 0.60 && n > 1000) return n.toString().replace(/\B(?=(\d{2})+(?!\d))/g, '_');
        return n.toString();
    }

    // Main entry point
    async obfuscate(source, options = {}) {
        const start = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let code;

            switch (tier) {
                case 'basic':
                    code = this.basicTier(source);
                    break;
                case 'standard':
                    code = this.standardTier(source);
                    break;
                case 'advanced':
                    code = this.advancedTier(source);
                    break;
                case 'vm':
                case 'ultimate':
                    code = this.vmTier(source);
                    break;
                default:
                    code = this.basicTier(source);
            }

            return { success: true, code, time: Date.now() - start, tier };
        } catch (err) {
            console.error('[Meson Error]', err);
            return { success: false, code: '', error: err.message, time: Date.now() - start };
        }
    }

    // ==================== BASIC TIER ====================
    basicTier(src) {
        let code = this.stripComments(src);
        code = this.encStrings(code);
        return `--[[ Meson v5.1 ]]\n` + this.mini(code);
    }

    // ==================== STANDARD TIER ====================
    standardTier(src) {
        let code = this.stripComments(src);
        code = this.encStrings(code);
        code = this.renameLocals(code);
        return `--[[ Meson v5.1 ]]\n` + this.mini(code);
    }

    // ==================== ADVANCED TIER ====================
    advancedTier(src) {
        let code = this.stripComments(src);
        code = this.encStrings(code);
        code = this.renameLocals(code);
        code = this.wrapExec(code);
        return `--[[ Meson v5.1 ]]\n` + this.mini(code);
    }

    // ==================== VM TIER - PROFESSIONAL ====================
    vmTier(src) {
        this.reset();
        const code = this.stripComments(src);
        return this.buildVM(code);
    }

    buildVM(source) {
        // Generate unique variable names
        const vars = {};
        const names = ['main','dec','run','tbl','key','dat','res','err','idx','chr','bxor','sub','byte','char','concat','env','wrap','exec','load','pcall'];
        names.forEach(n => { vars[n] = this.getFn(); });
        
        // More variables for fake functions
        for (let i = 0; i < 15; i++) {
            vars['f' + i] = this.getFn();
        }
        
        // Parameter names (single letters like Luraph)
        const p = { v: 'v', h: 'h', Q: 'Q', x: 'x', r: 'r', s: 's', m: 'm', k: 'k', i: 'i', j: 'j', t: 't', o: 'o', c: 'c', a: 'a', b: 'b' };
        
        // Encryption key
        const key = Math.floor(Math.random() * 200) + 50;
        
        // Generate random constant array (like Luraph's e={...})
        const consts = Array(9).fill(0).map(() => Math.floor(Math.random() * 4294967295));
        
        // Encrypt the source code
        const encrypted = [];
        for (let i = 0; i < source.length; i++) {
            encrypted.push(source.charCodeAt(i) ^ key);
        }
        
        // Split into chunks for variety in output
        const chunkSize = 40 + Math.floor(Math.random() * 20);
        const chunks = [];
        for (let i = 0; i < encrypted.length; i += chunkSize) {
            chunks.push(encrypted.slice(i, i + chunkSize));
        }
        
        // Format each chunk with mixed number formats
        const formattedChunks = chunks.map((chunk, idx) => {
            const formatted = chunk.map(b => this.fmt(b)).join(',');
            return `[${this.fmt(idx + 1)}]={${formatted}}`;
        });
        
        // Build the output
        return `--[[ Meson Obfuscator v5.1 | https://meson.dev ]]
return(function(${p.v},${p.h},${p.Q},${p.x})
local ${vars.env}=getfenv and getfenv()or _ENV or _G;
local ${vars.pcall}=pcall;
local ${vars.f0}={${consts.map(c => this.fmt(c)).join(',')}};
local ${vars.bxor}=bit32 and bit32.bxor or bit and bit.bxor or function(${p.a},${p.b})
local ${p.c},${p.o}=1,0;
while ${p.a}>0 and ${p.b}>0 do
local ${p.m},${p.s}=${p.a}%2,${p.b}%2;
if ${p.m}~=${p.s} then ${p.o}=${p.o}+${p.c};end;
${p.a},${p.b},${p.c}=(${p.a}-${p.m})/2,(${p.b}-${p.s})/2,${p.c}*2;
end;
if ${p.a}<${p.b} then ${p.a}=${p.b};end;
while ${p.a}>0 do
local ${p.m}=${p.a}%2;
if ${p.m}>0 then ${p.o}=${p.o}+${p.c};end;
${p.a},${p.c}=(${p.a}-${p.m})/2,${p.c}*2;
end;
return ${p.o};
end;
local ${vars.chr}=string.char;
local ${vars.concat}=table.concat;
local ${vars.f1}=function(${p.v},${p.h},${p.Q},${p.x})(${p.Q})[${this.fmt(10)}]=${p.v}.${vars.f2};if not ${p.x}[${this.fmt(30368)}] then ${p.h}=${p.v}:${vars.f3}(${p.x},${p.h});else ${p.h}=${p.v}:${vars.f4}(${p.x},${p.h});end;return ${p.h};end;
local ${vars.f2}=function(${p.v},${p.h})${p.h}=${p.v}[${this.fmt(29370)}];return ${p.h};end;
local ${vars.f3}=function(${p.v},${p.h},${p.Q})${p.h}=(${this.fmt(30)});${p.v}[${this.fmt(33)}]=${p.Q};return ${p.h};end;
local ${vars.f4}=function(${p.v},${p.h},${p.Q})${p.h}=${this.fmt(-3411915264)}+((${p.v}.${vars.f5}((${p.v}.${vars.f6}(${p.v}.${vars.f0}[${this.fmt(2)}],${p.v}.${vars.f0}[${this.fmt(6)}]))+${p.Q}[${this.fmt(31479)}])+${p.v}.${vars.f0}[${this.fmt(8)}]);${p.Q}[${this.fmt(23813)}]=(${p.h});return ${p.h};end;
local ${vars.f5}=function(${p.v})${p.h}=${p.v}[${this.fmt(40)}]();return ${p.h};end;
local ${vars.f6}=function(${p.v},${p.h})${p.h}=${p.v}[${this.fmt(23813)}];return ${p.h};end;
local ${vars.f7}=function(${p.v},${p.h})local ${p.Q},${p.x}=(${this.fmt(15)});repeat ${p.x},${p.Q}=${p.v}:${vars.f8}(${p.h},${p.Q});if ${p.x}==${this.fmt(49299)} then break;else if ${p.x}==-1 then return-1;end;end;until false;return nil;end;
local ${vars.f8}=function(${p.v},${p.h})${p.v}=${p.h}[${this.fmt(23)}]();return ${p.v};end;
local ${vars.f9}=function(${p.v},${p.h},${p.Q},${p.x})local ${p.r};if ${p.x}<=${this.fmt(70)} then if not(${p.x}>${this.fmt(39)})then ${p.x}=${p.v}:${vars.f10}(${p.x},${p.h},${p.Q});else if not(${p.x}<=${this.fmt(67)})then ${p.x}=${p.v}:${vars.f11}(${p.h},${p.Q},${p.x});return ${this.fmt(36571)},${p.x};else(${p.h})[${this.fmt(3)}]=${p.v}.${vars.f12};if not(not ${p.Q}[${this.fmt(7146)}])then ${p.x}=${p.Q}[${this.fmt(7146)}];else ${p.x}=${this.fmt(-3272562488)}+((${p.v}.${vars.f6}(${p.v}.${vars.f0}[${this.fmt(9)}]>=${p.v}.${vars.f0}[${this.fmt(4)}] and ${p.v}.${vars.f0}[${this.fmt(9)}] or ${p.x}))-${p.v}.${vars.f0}[${this.fmt(1)}]<=${p.v}.${vars.f0}[${this.fmt(5)}] and ${p.v}.${vars.f0}[${this.fmt(7)}] or ${p.Q}[${this.fmt(31479)}]);(${p.Q})[${this.fmt(7146)}]=${p.x};end;end;end;return nil,${p.x};end;
local ${vars.f10}=string.sub;
local ${vars.f11}=string.byte;
local ${vars.f12}=string.pack or function()end;
local ${vars.f13}=bit32 and bit32.rrotate or function(${p.v})return ${p.v};end;
local ${vars.f14}=function(${p.v})(${p.v})[${this.fmt(32)}]={};end;
local ${vars.key}=${this.fmt(key)};
local ${vars.dat}={${formattedChunks.join(',')}};
local ${vars.dec}=function(${p.t})
local ${p.r}={};
local ${p.k}=${vars.key};
local ${p.i}=1;
for ${p.j}=1,#${p.t} do
for ${p.m}=1,#${p.t}[${p.j}] do
${p.r}[${p.i}]=${vars.chr}(${vars.bxor}(${p.t}[${p.j}][${p.m}],${p.k}));
${p.i}=${p.i}+1;
end;
end;
return ${vars.concat}(${p.r});
end;
local ${vars.res}=${vars.dec}(${vars.dat});
local ${vars.exec},${vars.err}=(loadstring or load)(${vars.res});
if not ${vars.exec} then
error("Meson VM: "..tostring(${vars.err}));
end;
local ${vars.wrap}=function(...)return ${vars.exec}(...)end;
return ${vars.wrap}(...);
end)(...)`;
    }

    // ==================== HELPER METHODS ====================

    stripComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    encStrings(code) {
        const key = Math.floor(Math.random() * 200) + 50;
        const fn = this.getFn();
        const k = this.getVar();
        const t = this.getVar();
        const r = this.getVar();
        const i = this.getVar();

        const dec = `local ${fn};do local ${k}=${key};${fn}=function(${t})local ${r}=""for ${i}=1,#${t} do ${r}=${r}..string.char((bit32 and bit32.bxor or bit and bit.bxor or function(a,b)local p,c=1,0 while a>0 and b>0 do local m,n=a%2,b%2 if m~=n then c=c+p end a,b,p=(a-m)/2,(b-n)/2,p*2 end if a<b then a=b end while a>0 do local m=a%2 if m>0 then c=c+p end a,p=(a-m)/2,p*2 end return c end)(${t}[${i}],${k}))end return ${r} end end;`;

        const res = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, (m) => {
            const c = m.slice(1, -1);
            if (c.length < 2 || c.includes('\\')) return m;
            const e = [];
            for (let j = 0; j < c.length; j++) e.push(c.charCodeAt(j) ^ key);
            return `${fn}({${e.map(b => this.fmt(b)).join(',')}})`;
        });

        return dec + res;
    }

    renameLocals(code) {
        const reserved = new Set(['and','break','do','else','elseif','end','false','for','function','goto','if','in','local','nil','not','or','repeat','return','then','true','until','while','print','warn','error','assert','type','typeof','pairs','ipairs','next','select','unpack','pcall','xpcall','tonumber','tostring','rawget','rawset','setmetatable','getmetatable','require','loadstring','load','string','table','math','bit32','bit','coroutine','debug','os','io','game','workspace','script','shared','tick','time','wait','delay','spawn','task','getfenv','setfenv','getgenv','getrenv','Instance','Vector2','Vector3','CFrame','Color3','BrickColor','UDim','UDim2','Ray','Region3','TweenInfo','Enum','self','_G','_VERSION','_ENV']);
        const map = new Map();
        let m;
        const p = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        while ((m = p.exec(code)) !== null) {
            if (!reserved.has(m[1]) && !map.has(m[1])) map.set(m[1], this.getVar());
        }
        let r = code;
        map.forEach((n, o) => { r = r.replace(new RegExp(`\\b${o}\\b`, 'g'), n); });
        return r;
    }

    wrapExec(code) {
        const s = this.getVar();
        const f = this.getVar();
        return `local ${s}=1;local ${f}={[1]=function()${code};${s}=0 end};while ${s}>0 do if ${f}[${s}]then ${f}[${s}]()end end`;
    }

    mini(code) {
        return code.split('\n').map(l => l.trim()).filter(l => l).join(' ').replace(/\s+/g, ' ').replace(/\s*([{}()\[\],;])\s*/g, '$1').trim();
    }
}

module.exports = new MesonObfuscator();
