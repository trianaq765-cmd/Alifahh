/**
 * String Splitting Transform
 * Memecah string menjadi bagian-bagian kecil lalu digabung runtime
 * 
 * Before: "Hello World"
 * After:  ("Hel")..("lo ")..(("Wor")..("ld"))
 */

class StringSplit {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Split string into random chunks
     */
    splitString(str) {
        if (str.length < 4) return null;
        
        const chunks = [];
        let remaining = str;
        
        while (remaining.length > 0) {
            // Random chunk size between 2-5 characters
            const size = Math.min(
                Math.floor(Math.random() * 4) + 2,
                remaining.length
            );
            chunks.push(remaining.substring(0, size));
            remaining = remaining.substring(size);
        }
        
        return chunks;
    }

    /**
     * Build concatenation expression
     */
    buildConcat(chunks) {
        if (chunks.length === 1) {
            return '"' + this.escapeString(chunks[0]) + '"';
        }
        
        // Randomly nest some concatenations for complexity
        let result = '';
        let depth = 0;
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = '"' + this.escapeString(chunks[i]) + '"';
            
            if (i === 0) {
                // Random chance to wrap in parentheses
                if (Math.random() > 0.5) {
                    result = '(' + chunk + ')';
                } else {
                    result = chunk;
                }
            } else {
                // Random nesting patterns
                const pattern = Math.floor(Math.random() * 4);
                
                switch (pattern) {
                    case 0:
                        result = result + '..' + chunk;
                        break;
                    case 1:
                        result = result + '..(' + chunk + ')';
                        break;
                    case 2:
                        result = '(' + result + ')..' + chunk;
                        break;
                    case 3:
                        result = '(' + result + '..' + chunk + ')';
                        break;
                }
            }
        }
        
        return result;
    }

    /**
     * Escape special characters in string
     */
    escapeString(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    /**
     * Apply string splitting to code
     */
    apply(code) {
        // Match string literals
        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        return code.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            // Skip short strings or strings with escapes
            if (content.length < 6 || content.includes('\\')) {
                return match;
            }
            
            // 70% chance to split
            if (Math.random() > 0.7) {
                return match;
            }
            
            const chunks = this.splitString(content);
            if (!chunks || chunks.length < 2) {
                return match;
            }
            
            return '(' + this.buildConcat(chunks) + ')';
        });
    }
}

module.exports = StringSplit;
