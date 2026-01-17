/**
 * Dead Code Injection Transform
 * Adds fake code that never executes
 */

class DeadCode {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate random dead code snippets
     */
    generateDeadCode() {
        const snippets = [
            // Fake variable declarations
            () => {
                const v = this.obf.generateName();
                const val = Math.floor(Math.random() * 10000);
                return `local ${v}=${val};`;
            },
            // Fake function calls (never called)
            () => {
                const f = this.obf.generateName();
                return `local ${f}=function()return nil end;`;
            },
            // Fake conditionals (always false)
            () => {
                const v = this.obf.generateName();
                const a = Math.floor(Math.random() * 100) + 100;
                const b = a + Math.floor(Math.random() * 50) + 1;
                return `local ${v}=nil;if ${a}>${b} then ${v}=true end;`;
            },
            // Fake loops (never execute)
            () => {
                const v = this.obf.generateName();
                return `local ${v}=0;while false do ${v}=${v}+1 end;`;
            },
            // Fake table
            () => {
                const t = this.obf.generateName();
                const vals = Array(3).fill(0).map(() => Math.floor(Math.random() * 100));
                return `local ${t}={${vals.join(',')}};`;
            },
            // Fake string operation
            () => {
                const s = this.obf.generateName();
                return `local ${s}=string.rep("",0);`;
            },
            // Fake math
            () => {
                const v = this.obf.generateName();
                const a = Math.floor(Math.random() * 100);
                const b = Math.floor(Math.random() * 100);
                return `local ${v}=math.floor(${a}*0+${b}*0);`;
            }
        ];

        const count = Math.floor(Math.random() * 3) + 2;
        const deadCode = [];
        
        for (let i = 0; i < count; i++) {
            const snippet = snippets[Math.floor(Math.random() * snippets.length)];
            deadCode.push(snippet());
        }

        return deadCode.join('');
    }

    /**
     * Apply dead code injection
     */
    apply(code) {
        // Add dead code at the beginning
        const prefix = this.generateDeadCode();
        
        // Add dead code at random positions (between top-level statements)
        let result = prefix + code;
        
        // Find good injection points (after 'end' keywords at line start)
        const injectionPoints = [];
        const lines = result.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === 'end' || lines[i].trim().endsWith('end')) {
                injectionPoints.push(i);
            }
        }

        // Inject at some random points
        const injectCount = Math.min(3, Math.floor(injectionPoints.length / 3));
        const selectedPoints = [];
        
        for (let i = 0; i < injectCount; i++) {
            if (injectionPoints.length > 0) {
                const idx = Math.floor(Math.random() * injectionPoints.length);
                selectedPoints.push(injectionPoints[idx]);
                injectionPoints.splice(idx, 1);
            }
        }

        // Sort descending to insert from bottom up
        selectedPoints.sort((a, b) => b - a);

        for (const point of selectedPoints) {
            lines.splice(point + 1, 0, this.generateDeadCode());
        }

        return lines.join('\n');
    }
}

module.exports = DeadCode;
