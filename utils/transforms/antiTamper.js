/**
 * Anti-Tamper Transform
 * Mendeteksi modifikasi code dan environment
 */

class AntiTamper {
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
     * Generate integrity check
     * Membuat checksum sederhana dari bagian code
     */
    generateIntegrityCheck() {
        const v = {
            check: this.generateVarName(),
            hash: this.generateVarName(),
            str: this.generateVarName(),
            i: this.generateVarName(),
            c: this.generateVarName(),
        };

        // Simple hash function
        return `local ${v.check}=function(${v.str})local ${v.hash}=0;for ${v.i}=1,#${v.str} do ${v.hash}=(${v.hash}*31+string.byte(${v.str},${v.i}))%2147483647 end;return ${v.hash} end;`;
    }

    /**
     * Environment detection
     * Mendeteksi apakah berjalan di environment yang benar
     */
    generateEnvCheck() {
        const v = {
            check: this.generateVarName(),
            result: this.generateVarName(),
            err: this.generateVarName(),
        };

        const checks = [
            // Check if game exists (Roblox)
            `local ${v.check}=function()`,
            `local ${v.result}=true;`,
            // Check game
            `if not game then ${v.result}=false end;`,
            // Check workspace
            `if not workspace then ${v.result}=false end;`,
            // Check essential services exist
            `local ${v.err};`,
            `${v.err}=pcall(function()return game:GetService("Players")end);`,
            `if not ${v.err} then ${v.result}=false end;`,
            // Check if running in correct context
            `if not pcall(function()return game.PlaceId end)then ${v.result}=false end;`,
            `return ${v.result};`,
            `end;`,
            `if not ${v.check}()then return end;`,
        ];

        return checks.join('');
    }

    /**
     * Function hook detection
     * Mendeteksi jika fungsi penting sudah di-hook
     */
    generateHookDetection() {
        const v = {
            original: this.generateVarName(),
            test: this.generateVarName(),
            check: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `local ${v.original}=tostring;`,
            `local ${v.test}=tostring(tostring);`,
            `if not ${v.test}:find("builtin")and not ${v.test}:find("native")and not ${v.test}:find("function")then`,
            `return false;`,
            `end;`,
            `return true;`,
            `end;`,
            `if not ${v.check}()then return end;`,
        ].join('');
    }

    /**
     * Time-based check
     * Mendeteksi jika code berjalan terlalu lambat (debugging)
     */
    generateTimeCheck() {
        const v = {
            start: this.generateVarName(),
            elapsed: this.generateVarName(),
            limit: this.generateVarName(),
        };

        const limit = 100 + Math.floor(Math.random() * 200); // 100-300ms

        return [
            `local ${v.start}=tick and tick()or os.clock();`,
            `local ${v.limit}=${limit}/1000;`,
            // Check akan dilakukan di akhir
            `local ${v.elapsed}=function()`,
            `local _t=tick and tick()or os.clock();`,
            `if(_t-${v.start})>${v.limit}*10 then return end;`,
            `end;`,
        ].join('');
    }

    /**
     * Metatable protection check
     */
    generateMetatableCheck() {
        const v = {
            test: this.generateVarName(),
            mt: this.generateVarName(),
            check: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `local ${v.test}={};`,
            `local ${v.mt}=getmetatable(game);`,
            `if ${v.mt} and type(${v.mt})=="table" and not ${v.mt}.__metatable then`,
            `return false;`,
            `end;`,
            `return true;`,
            `end;`,
            `pcall(${v.check});`,
        ].join('');
    }

    /**
     * Script context check
     */
    generateContextCheck() {
        const v = {
            check: this.generateVarName(),
            ctx: this.generateVarName(),
        };

        return [
            `local ${v.check}=function()`,
            `local ${v.ctx}=script;`,
            `if not ${v.ctx} then return true end;`,
            `if ${v.ctx}.ClassName~="LocalScript" and ${v.ctx}.ClassName~="ModuleScript" then`,
            `return true;`,
            `end;`,
            `return true;`,
            `end;`,
            `pcall(${v.check});`,
        ].join('');
    }

    /**
     * Apply anti-tamper checks
     */
    apply(code) {
        const checks = [];

        // 80% chance for each check
        if (Math.random() > 0.2) {
            checks.push(this.generateEnvCheck());
        }
        if (Math.random() > 0.2) {
            checks.push(this.generateHookDetection());
        }
        if (Math.random() > 0.3) {
            checks.push(this.generateTimeCheck());
        }
        if (Math.random() > 0.3) {
            checks.push(this.generateMetatableCheck());
        }
        if (Math.random() > 0.4) {
            checks.push(this.generateContextCheck());
        }

        return checks.join('') + code;
    }
}

module.exports = AntiTamper;
