/**
 * Opaque Predicates Transform
 * Adds conditions that are always true/false but hard to analyze
 */

class OpaquePredicates {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate opaque predicate that's always true
     */
    generateAlwaysTrue() {
        const predicates = [
            // Mathematical truths
            () => {
                const n = Math.floor(Math.random() * 100) + 1;
                return `(${n}*${n}>=${n})`;
            },
            // String truths
            () => `(type("")=="string")`,
            // Table truths
            () => `(type({})=="table")`,
            // Math truths
            () => {
                const n = Math.floor(Math.random() * 100) + 1;
                return `(math.abs(${n})==${n})`;
            },
            // Bit operation truths
            () => {
                const n = Math.floor(Math.random() * 100);
                return `((${n}+1)>(${n}))`;
            },
            // Length comparison
            () => `(#""==0)`,
            // Type check
            () => `(type(nil)=="nil")`,
            // Numeric comparison
            () => {
                const a = Math.floor(Math.random() * 50);
                const b = a + Math.floor(Math.random() * 50) + 1;
                return `(${b}>${a})`;
            }
        ];

        return predicates[Math.floor(Math.random() * predicates.length)]();
    }

    /**
     * Generate opaque predicate that's always false
     */
    generateAlwaysFalse() {
        const predicates = [
            () => `(type("")=="number")`,
            () => `(type({})=="string")`,
            () => `(1>2)`,
            () => `(#""~=0)`,
            () => {
                const n = Math.floor(Math.random() * 100) + 1;
                return `(${n}>${n}+1)`;
            },
            () => `(type(nil)=="table")`,
            () => `(false==true)`
        ];

        return predicates[Math.floor(Math.random() * predicates.length)]();
    }

    /**
     * Wrap code in opaque conditional
     */
    wrapInOpaque(code) {
        const predicate = this.generateAlwaysTrue();
        const fakeCode = `error("unreachable")`;
        
        return `if ${predicate} then ${code} else ${fakeCode} end`;
    }

    /**
     * Apply opaque predicates to code
     */
    apply(code) {
        // Add opaque predicate wrapper at the start
        const checkVar = this.obf.generateName();
        const predicate = this.generateAlwaysTrue();
        
        const prefix = `local ${checkVar}=${predicate};if not ${checkVar} then return end;`;
        
        // Add another check with fake branch
        const check2 = this.generateAlwaysFalse();
        const fakeVar = this.obf.generateName();
        const fakeCheck = `if ${check2} then local ${fakeVar}=nil;${fakeVar}()end;`;
        
        return prefix + fakeCheck + code;
    }
}

module.exports = OpaquePredicates;
