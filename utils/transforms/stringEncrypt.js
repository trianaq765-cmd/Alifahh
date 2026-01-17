/**
 * String Encryption Transform
 * Multiple encryption methods: XOR, Base64-like, Caesar
 */

class StringEncrypt {
    constructor(obfuscator) {
        this.obf = obfuscator;
        this.key = Math.floor(Math.random() * 200) + 50;
    }

    /**
     * Generate decoder function
     */
    generateDecoder() {
        const funcName = this.obf.generateName();
        const keyVar = this.obf.generateName();
        
        // XOR decoder with bit32/bit library fallback
        const decoder = `local ${funcName};do local ${keyVar}=${this.key};${funcName}=function(e)local r=""for i=1,#e do r=r..string.char((bit32 and bit32.bxor or function(a,b)return a~=b and 1 or 0 end)(e[i],${keyVar}))end return r end end;`;
        
        return { name: funcName, code: decoder };
    }

    /**
     * Generate advanced decoder with multiple layers
     */
    generateAdvancedDecoder() {
        const funcName = this.obf.generateName();
        const keyVar = this.obf.generateName();
        const tableVar = this.obf.generateName();
        
        // More complex decoder with table lookup
        const decoder = `local ${funcName};do local ${keyVar}=${this.key};local ${tableVar}={};for i=0,255 do ${tableVar}[i]=string.char(i)end;${funcName}=function(e)local r=""for i=1,#e do local c=e[i]local x=bit32 and bit32.bxor(c,${keyVar})or(c~=${keyVar}and c or 0)r=r..(${tableVar}[x]or string.char(x))end return r end end;`;
        
        return { name: funcName, code: decoder };
    }

    /**
     * Encrypt a string
     */
    encryptString(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ this.key);
        }
        return bytes;
    }

    /**
     * Check if string should be encrypted
     */
    shouldEncrypt(content, fullMatch) {
        if (content.length < 3) return false;
        if (content.includes('\\')) return false;
        // Skip format strings
        if (content.includes('%s') || content.includes('%d')) return false;
        // Skip patterns
        if (content.match(/[\[\]%\^$\(\)\.\*\+\-\?]/)) return false;
        return true;
    }

    /**
     * Apply basic string encryption
     */
    apply(code) {
        const decoder = this.generateDecoder();
        let result = code;

        // Match strings and encrypt them
        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        result = result.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            if (!this.shouldEncrypt(content, match)) {
                return match;
            }

            const encrypted = this.encryptString(content);
            return `${decoder.name}({${encrypted.join(',')}})`;
        });

        return decoder.code + result;
    }

    /**
     * Apply advanced multi-layer encryption
     */
    applyAdvanced(code) {
        const decoder = this.generateAdvancedDecoder();
        let result = code;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        result = result.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            if (!this.shouldEncrypt(content, match)) {
                return match;
            }

            // Encrypt with additional obfuscation
            const encrypted = this.encryptString(content);
            
            // Randomly add math operations to array
            const obfuscatedArray = encrypted.map(b => {
                if (Math.random() > 0.7) {
                    const offset = Math.floor(Math.random() * 100);
                    return `(${b + offset}-${offset})`;
                }
                return b;
            });

            return `${decoder.name}({${obfuscatedArray.join(',')}})`;
        });

        return decoder.code + result;
    }
}

module.exports = StringEncrypt;
