/**
 * Anti-Debug Transform
 * Mendeteksi dan menggagalkan debugging attempts
 */

class AntiDebug {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    generateVarName() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let name = '_';
        for (let i = 0; i < 4; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name + Math.floor(Math.random() * 100);
    }

    /**
     * Debug library detection
     */
    generateDebugLibCheck() {
        const v = {
            check: this.generateVarName(),
            dbg: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `local ${v.dbg}=debug;`,
            `if ${v.dbg} and ${v.dbg}.getinfo then`,
            `local _i=${v.dbg}.getinfo(1);`,
            `if _i and _i.what=="C" then return false end;`,
            `end;`,
            `return true;`,
            `end;`,
            `pcall(${v.check});`,
        ].join('');
    }

    /**
     * Breakpoint detection via timing
     */
    generateBreakpointDetection() {
        const v = {
            t1: this.generateVarName(),
            t2: this.generateVarName(),
            diff: this.generateVarName(),
            threshold: this.generateVarName(),
        };

        return [
            `local ${v.threshold}=0.05;`,
            `local ${v.t1}=tick and tick()or os.clock();`,
            `local _=1+1;`,
            `local ${v.t2}=tick and tick()or os.clock();`,
            `local ${v.diff}=${v.t2}-${v.t1};`,
            `if ${v.diff}>${v.threshold} then`,
            `return;`,
            `end;`,
        ].join('');
    }

    /**
     * Stack trace obfuscation
     */
    generateStackObfuscation() {
        const v = {
            wrap: this.generateVarName(),
            func: this.generateVarName(),
            args: this.generateVarName(),
            result: this.generateVarName(),
            err: this.generateVarName(),
        };

        return [
            `local ${v.wrap}=function(${v.func})`,
            `return function(...)`,
            `local ${v.result}={pcall(${v.func},...)}`,
            `if ${v.result}[1] then`,
            `return unpack(${v.result},2)`,
            `end`,
            `end`,
            `end;`,
        ].join('');
    }

    /**
     * getfenv/setfenv detection
     */
    generateEnvTamperCheck() {
        const v = {
            check: this.generateVarName(),
            env: this.generateVarName(),
            original: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `if getfenv then`,
            `local ${v.env}=getfenv(1);`,
            `if ${v.env}~=_G and ${v.env}~=_ENV then`,
            `local ${v.original}=getfenv(0);`,
            `if ${v.env}~=${v.original} then return false end;`,
            `end;`,
            `end;`,
            `return true;`,
            `end;`,
            `if not pcall(${v.check})then end;`,
        ].join('');
    }

    /**
     * Upvalue tampering detection
     */
    generateUpvalueCheck() {
        const v = {
            check: this.generateVarName(),
            sentinel: this.generateVarName(),
            value: this.generateVarName(),
        };

        const sentinel = Math.floor(Math.random() * 1000000);

        return [
            `local ${v.sentinel}=${sentinel};`,
            `local ${v.check}=function()`,
            `if ${v.sentinel}~=${sentinel} then return end;`,
            `return true;`,
            `end;`,
            `${v.check}();`,
        ].join('');
    }

    /**
     * Decompiler trick - self-modifying patterns
     */
    generateDecompilerTrick() {
        const v = {
            a: this.generateVarName(),
            b: this.generateVarName(),
            c: this.generateVarName(),
            fn: this.generateVarName(),
        };

        // Complex patterns that confuse decompilers
        const tricks = [
            // Multiple return confusion
            `local ${v.fn}=function()if true then return 1 end return 2 end;${v.fn}();`,
            // Tail call confusion
            `local ${v.fn}=function(${v.a})return ${v.a} and ${v.fn}(${v.a}-1)or 0 end;pcall(${v.fn},0);`,
            // Goto simulation (confuses some decompilers)
            `local ${v.a}=1;repeat if ${v.a}==1 then ${v.a}=2 elseif ${v.a}==2 then break end until false;`,
            // Nested function confusion
            `local ${v.fn}=(function()return function()return function()return nil end end end)()();`,
        ];

        return tricks[Math.floor(Math.random() * tricks.length)];
    }

    /**
     * Coroutine-based check
     */
    generateCoroutineCheck() {
        const v = {
            co: this.generateVarName(),
            check: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `local ${v.co}=coroutine.running();`,
            `if not ${v.co} then return true end;`,
            `local _s=coroutine.status(${v.co});`,
            `return _s=="running";`,
            `end;`,
            `pcall(${v.check});`,
        ].join('');
    }

    /**
     * Apply anti-debug checks
     */
    apply(code) {
        const checks = [];

        // Apply various checks with random probability
        if (Math.random() > 0.2) {
            checks.push(this.generateDebugLibCheck());
        }
        if (Math.random() > 0.3) {
            checks.push(this.generateBreakpointDetection());
        }
        if (Math.random() > 0.3) {
            checks.push(this.generateEnvTamperCheck());
        }
        if (Math.random() > 0.4) {
            checks.push(this.generateUpvalueCheck());
        }
        if (Math.random() > 0.2) {
            checks.push(this.generateDecompilerTrick());
        }
        if (Math.random() > 0.4) {
            checks.push(this.generateCoroutineCheck());
        }

        // Wrap code with protection
        const v = {
            protected: this.generateVarName(),
            err: this.generateVarName(),
        };

        const wrapped = [
            checks.join(''),
            `local ${v.protected}=function()`,
            code,
            `end;`,
            `${v.protected}();`,
        ].join('');

        return wrapped;
    }
}

module.exports = AntiDebug;
