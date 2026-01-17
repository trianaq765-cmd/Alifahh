/**
 * Number Encoding Transform
 * Converts numbers to mathematical expressions
 */

class NumberEncode {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate random math expression for a number
     */
    encodeNumber(num) {
        const methods = [
            // Method 1: Addition
            () => {
                const a = Math.floor(Math.random() * 1000);
                return `(${a}+${num - a})`;
            },
            // Method 2: Subtraction
            () => {
                const a = num + Math.floor(Math.random() * 1000);
                return `(${a}-${a - num})`;
            },
            // Method 3: Multiplication (for numbers divisible by small primes)
            () => {
                const factors = [2, 3, 5, 7];
                for (const f of factors) {
                    if (num % f === 0 && num !== 0) {
                        return `(${num / f}*${f})`;
                    }
                }
                // Fallback to addition
                const a = Math.floor(Math.random() * 100);
                return `(${a}+${num - a})`;
            },
            // Method 4: Bitwise XOR
            () => {
                const key = Math.floor(Math.random() * 255);
                const encoded = num ^ key;
                return `(bit32 and bit32.bxor(${encoded},${key})or ${num})`;
            },
            // Method 5: Division
            () => {
                const divisor = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
                return `(${num * divisor}/${divisor})`;
            },
            // Method 6: Nested operations
            () => {
                const a = Math.floor(Math.random() * 50);
                const b = Math.floor(Math.random() * 50);
                return `((${num + a + b}-${a})-${b})`;
            }
        ];

        const method = methods[Math.floor(Math.random() * methods.length)];
        return method();
    }

    /**
     * Apply number encoding to code
     */
    apply(code) {
        let result = code;

        // Match standalone numbers (not in strings, not after dots)
        // This regex is careful not to match:
        // - Numbers in strings
        // - Decimal parts (.5)
        // - Hex numbers (0x...)
        // - Very small numbers
        
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxX])/g;
        
        result = result.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            
            // Skip very small numbers and special cases
            if (n < 2 || n > 99999) return match;
            
            // 60% chance to encode
            if (Math.random() > 0.6) return match;
            
            return this.encodeNumber(n);
        });

        return result;
    }
}

module.exports = NumberEncode;
