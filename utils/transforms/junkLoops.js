/**
 * Junk Loops Transform
 * Menambahkan loop yang tidak pernah dieksekusi atau langsung keluar
 */

class JunkLoops {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate random junk variable name
     */
    generateVarName() {
        const prefixes = ['_j', '_x', '_z', '_q', '_unused'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + Math.floor(Math.random() * 1000);
    }

    /**
     * Generate a junk loop that never executes
     */
    generateJunkLoop() {
        // Defines array of functions that RETURN strings
        const types = [
            // For loop that never runs (start > end)
            () => {
                const v = this.generateVarName();
                const start = Math.floor(Math.random() * 100) + 100;
                const endVal = Math.floor(Math.random() * 50);
                return `for ${v}=${start},${endVal} do end;`;
            },
            // While false
            () => {
                const v = this.generateVarName();
                return `while false do local ${v}=nil end;`;
            },
            // Repeat with immediate break
            () => {
                const v = this.generateVarName();
                return `repeat local ${v}=0;break until true;`;
            },
            // For loop with 0 iterations
            () => {
                const v = this.generateVarName();
                return `for ${v}=1,0 do end;`;
            },
            // Conditional that never triggers
            () => {
                const v = this.generateVarName();
                const a = Math.floor(Math.random() * 100);
                return `if ${a}>${a + 100} then for ${v}=1,10 do end end;`;
            },
            // Empty pairs loop on empty table
            () => {
                const k = this.generateVarName();
                const v = this.generateVarName();
                return `for ${k},${v} in pairs({}) do end;`;
            }
        ];
        
        // Execute one random function from the array
        const selectedFunc = types[Math.floor(Math.random() * types.length)];
        return selectedFunc();
    }

    /**
     * Generate fake computations inside conditional blocks
     */
    generateFakeComputation() {
        const v = this.generateVarName();
        const v2 = this.generateVarName();
        const a = Math.floor(Math.random() * 1000);
        const b = Math.floor(Math.random() * 1000);
        
        const types = [
            () => `local ${v}=0;for _=1,0 do ${v}=${v}+1 end;`,
            () => `local ${v}=${a};local ${v2}=${b};if ${v}>${a + b} then ${v}=${v2} end;`,
            () => `local ${v}=function()return nil end;if false then ${v}()end;`,
            () => `local ${v}={};while #${v}>100 do table.insert(${v},1)end;`
        ];
        
        const selectedFunc = types[Math.floor(Math.random() * types.length)];
        return selectedFunc();
    }

    /**
     * Apply junk loops to code
     */
    apply(code) {
        // Add 2-4 junk loops at the beginning
        const count = Math.floor(Math.random() * 3) + 2;
        const junk = [];
        
        for (let i = 0; i < count; i++) {
            if (Math.random() > 0.5) {
                junk.push(this.generateJunkLoop());
            } else {
                junk.push(this.generateFakeComputation());
            }
        }
        
        // Also try to insert some junk after 'end' keywords
        let result = code;
        let insertions = 0;
        const maxInsertions = 3;
        
        // Use a callback function for replacement
        result = result.replace(/\bend\b/g, (match) => {
            if (insertions >= maxInsertions) return match;
            // 30% chance to insert junk
            if (Math.random() > 0.7) return match;
            
            insertions++;
            return match + ';' + this.generateJunkLoop();
        });
        
        return junk.join('') + result;
    }
}

module.exports = JunkLoops;
