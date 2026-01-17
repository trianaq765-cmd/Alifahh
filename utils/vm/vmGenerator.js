/**
 * VM Generator - Generates the virtual machine interpreter
 */

class VMGenerator {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate the complete VM with encrypted bytecode
     */
    generate(encryptedData) {
        const vmVars = {
            vm: this.obf.generateName(),
            stack: this.obf.generateName(),
            constants: this.obf.generateName(),
            bytecode: this.obf.generateName(),
            pc: this.obf.generateName(),
            top: this.obf.generateName(),
            base: this.obf.generateName(),
            upvalues: this.obf.generateName(),
            env: this.obf.generateName(),
            decode: this.obf.generateName(),
            run: this.obf.generateName(),
            wrap: this.obf.generateName(),
            handlers: this.obf.generateName(),
            key: this.obf.generateName(),
            data: this.obf.generateName(),
            result: this.obf.generateName()
        };

        // Generate the VM code
        return this.generateVMCode(vmVars, encryptedData);
    }

    /**
     * Generate complete VM source code
     */
    generateVMCode(v, data) {
        const key = data.key;
        const bytecodeStr = data.bytecode.join(',');
        const constantsStr = this.serializeConstants(data.constants, key);

        return `return(function()
local ${v.key}=${this.obf.formatNumber(key)};
local ${v.data}={${bytecodeStr}};
local ${v.constants}=(function(${v.decode})
local ${v.result}={}
local ${v.key}=${this.obf.formatNumber(key)}
${constantsStr}
return ${v.result}
end)();
local ${v.handlers}={};
local ${v.env}=getfenv and getfenv()or _ENV or _G;
local ${v.wrap}=function(${v.vm})
return function(...)
local ${v.stack}={}
local ${v.upvalues}={}
local ${v.pc}=1
local ${v.top}=0
local ${v.base}=0
local args={...}
local nargs=select("#",...)
for i=1,nargs do ${v.stack}[i]=args[i]end
${v.top}=nargs
while true do
local op=${v.data}[${v.pc}]
if not op then break end
local handler=${v.handlers}[op]
if handler then
local result=handler(${v.stack},${v.constants},${v.upvalues},${v.env},${v.pc},${v.top},${v.base},${v.data})
if type(result)=="table"then
if result.ret then return unpack(result.ret)end
if result.pc then ${v.pc}=result.pc end
if result.top then ${v.top}=result.top end
end
end
${v.pc}=${v.pc}+1
end
end
end;
${this.generateHandlers(v)}
return ${v.wrap}(${v.data})(...)
end)(...)`;
    }

    /**
     * Serialize constants for embedding
     */
    serializeConstants(constants, key) {
        const lines = [];
        for (let i = 0; i < constants.length; i++) {
            const c = constants[i];
            if (c.type === 'number') {
                lines.push(`${this.obf.generateName()}[${this.obf.formatNumber(i + 1)}]=${this.obf.formatNumber(c.value)}`);
            } else if (c.type === 'string') {
                // Encrypt string
                const encrypted = [];
                for (let j = 0; j < c.value.length; j++) {
                    encrypted.push((c.value.charCodeAt(j) ^ key) & 0xFF);
                }
                const varName = this.obf.generateName();
                lines.push(`local ${varName}={${encrypted.map(b => this.obf.formatNumber(b)).join(',')}}`);
                lines.push(`local ${this.obf.generateName()}=""for ${this.obf.generateName()}=1,#${varName} do ${this.obf.generateName()}=${this.obf.generateName()}..string.char((bit32 and bit32.bxor or function(a,b)return a~=b and 1 or 0 end)(${varName}[${this.obf.generateName()}],${this.obf.formatNumber(key)}))end`);
                lines.push(`${this.obf.generateName()}[${this.obf.formatNumber(i + 1)}]=${this.obf.generateName()}`);
            } else if (c.type === 'boolean') {
                lines.push(`${this.obf.generateName()}[${this.obf.formatNumber(i + 1)}]=${c.value}`);
            } else if (c.type === 'function') {
                // Nested function - serialize recursively
                lines.push(`${this.obf.generateName()}[${this.obf.formatNumber(i + 1)}]="function"`);
            }
        }
        return lines.join('\n');
    }

    /**
     * Generate opcode handlers
     */
    generateHandlers(v) {
        const h = v.handlers;
        const s = this.obf.generateName(); // stack
        const c = this.obf.generateName(); // constants
        const u = this.obf.generateName(); // upvalues
        const e = this.obf.generateName(); // env
        const pc = this.obf.generateName(); // pc
        const t = this.obf.generateName(); // top
        const b = this.obf.generateName(); // base
        const d = this.obf.generateName(); // data

        return `
-- LOADK: Load constant
${h}[${this.obf.formatNumber(0x01)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
${t}=${t}+1
${s}[${t}]=${c}[idx]
return{pc=${pc}+1}
end
-- LOADNIL
${h}[${this.obf.formatNumber(0x02)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
${t}=${t}+1
${s}[${t}]=nil
return{}
end
-- LOADBOOL
${h}[${this.obf.formatNumber(0x03)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local val=${d}[${pc}+1]
${t}=${t}+1
${s}[${t}]=val==1
return{pc=${pc}+1}
end
-- GETGLOBAL
${h}[${this.obf.formatNumber(0x04)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
local name=${c}[idx]
${t}=${t}+1
${s}[${t}]=${e}[name]
return{pc=${pc}+1}
end
-- SETGLOBAL
${h}[${this.obf.formatNumber(0x05)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
local name=${c}[idx]
${e}[name]=${s}[${t}]
${t}=${t}-1
return{pc=${pc}+1}
end
-- GETLOCAL
${h}[${this.obf.formatNumber(0x06)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
${t}=${t}+1
${s}[${t}]=${s}[${b}+idx]
return{pc=${pc}+1}
end
-- SETLOCAL
${h}[${this.obf.formatNumber(0x07)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
${s}[${b}+idx]=${s}[${t}]
${t}=${t}-1
return{pc=${pc}+1}
end
-- GETTABLE
${h}[${this.obf.formatNumber(0x08)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
local key=idx and ${c}[idx]or ${s}[${t}]
if not idx then ${t}=${t}-1 end
local tbl=${s}[${t}]
${s}[${t}]=tbl[key]
return{pc=idx and ${pc}+1 or ${pc}}
end
-- SETTABLE
${h}[${this.obf.formatNumber(0x09)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local val=${s}[${t}]
local key=${s}[${t}-1]
local tbl=${s}[${t}-2]
tbl[key]=val
${t}=${t}-2
return{}
end
-- NEWTABLE
${h}[${this.obf.formatNumber(0x0A)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
${t}=${t}+1
${s}[${t}]={}
return{pc=${pc}+1}
end
-- ADD
${h}[${this.obf.formatNumber(0x0B)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
${s}[${t}]=a+b
return{}
end
-- SUB
${h}[${this.obf.formatNumber(0x0C)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
${s}[${t}]=a-b
return{}
end
-- MUL
${h}[${this.obf.formatNumber(0x0D)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
${s}[${t}]=a*b
return{}
end
-- DIV
${h}[${this.obf.formatNumber(0x0E)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
${s}[${t}]=a/b
return{}
end
-- CALL
${h}[${this.obf.formatNumber(0x19)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local nargs=${d}[${pc}+1]
local nret=${d}[${pc}+2]
local args={}
for i=1,nargs do
args[i]=${s}[${t}-nargs+i]
end
${t}=${t}-nargs
local func=${s}[${t}]
local results={func(unpack(args))}
if nret>0 then
for i=1,nret do
${s}[${t}+i-1]=results[i]
end
${t}=${t}+nret-1
else
${t}=${t}-1
end
return{pc=${pc}+2}
end
-- RETURN
${h}[${this.obf.formatNumber(0x1A)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local nret=${d}[${pc}+1]or 0
local results={}
for i=1,nret do
results[i]=${s}[${t}-nret+i]
end
return{ret=results}
end
-- CONCAT
${h}[${this.obf.formatNumber(0x14)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
${s}[${t}]=tostring(a)..tostring(b)
return{}
end
-- LEN
${h}[${this.obf.formatNumber(0x13)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
${s}[${t}]=#${s}[${t}]
return{}
end
-- NOT
${h}[${this.obf.formatNumber(0x12)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
${s}[${t}]=not ${s}[${t}]
return{}
end
-- UNM
${h}[${this.obf.formatNumber(0x11)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
${s}[${t}]=-${s}[${t}]
return{}
end
-- EQ
${h}[${this.obf.formatNumber(0x16)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local inv=${d}[${pc}+1]
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
local result=(a==b)
if inv==0 then result=not result end
${s}[${t}]=result
return{pc=${pc}+1}
end
-- LT
${h}[${this.obf.formatNumber(0x17)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local inv=${d}[${pc}+1]
local b=${s}[${t}]
${t}=${t}-1
local a=${s}[${t}]
local result
if inv==1 then result=(a<b)else result=(b<a)end
${s}[${t}]=result
return{pc=${pc}+1}
end
-- JMP
${h}[${this.obf.formatNumber(0x15)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local target=${d}[${pc}+1]
local cond=${s}[${t}]
if not cond then
return{pc=target-1}
end
${t}=${t}-1
return{pc=${pc}+1}
end
-- SELF (method call prep)
${h}[${this.obf.formatNumber(0x1F)}]=function(${s},${c},${u},${e},${pc},${t},${b},${d})
local idx=${d}[${pc}+1]
local method=${c}[idx]
local obj=${s}[${t}]
${s}[${t}]=obj[method]
${t}=${t}+1
${s}[${t}]=obj
return{pc=${pc}+1}
end
`;
    }
}

module.exports = VMGenerator;
