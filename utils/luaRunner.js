/**
 * Lua Obfuscator - Pure JavaScript Implementation
 * Simplified version without external Lua VM
 */

class LuaObfuscator {
    constructor() {
        this.varCounter = 0;
        this.stringKey = Math.floor(Math.random() * 255);
    }

    /**
     * Generate random variable name
     */
    generateVarName() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const prefixes = ['_', 'l', 'I', 'O'];
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        for (let i = 0; i < 8; i++) {
            if (Math.random() > 0.5) {
                name += chars[Math.floor(Math.random() * chars.length)];
            } else {
                name += Math.floor(Math.random() * 10);
            }
        }
        
        return name + '_' + (this.varCounter++);
    }

    /**
     * XOR encrypt string
     */
    encryptString(str) {
        let encrypted = [];
        for (let i = 0; i < str.length; i++) {
            encrypted.push(str.charCodeAt(i) ^ this.stringKey);
        }
        return encrypted;
    }

    /**
     * Generate string decryption function
     */
    generateDecryptor() {
        const funcName = this.generateVarName();
        const keyVar = this.generateVarName();
        const code = `local ${funcName};do local ${keyVar}=${this.stringKey};${funcName}=function(t)local r="";for i=1,#t do r=r..string.char(t[i]~${keyVar})end;return r;end;end;`;
        return { funcName, code };
    }

    /**
     * Main obfuscation function
     */
    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        
        try {
            let output = sourceCode;
            
            // Collect all strings
            const strings = [];
            const stringPattern = /(["'])(?:(?!\1|\\).|\\.)*\1/g;
            
            // Generate decryptor
            const decryptor = this.generateDecryptor();
            
            // Replace strings with encrypted versions
            if (options.tier !== 'none') {
                output = output.replace(stringPattern, (match) => {
                    // Don't encrypt very short strings or special patterns
                    if (match.length <= 3) return match;
                    
                    const quote = match[0];
                    const content = match.slice(1, -1);
                    
                    // Skip if contains escape sequences we can't handle
                    if (content.includes('\\')) return match;
                    
                    const encrypted = this.encryptString(content);
                    return `${decryptor.funcName}({${encrypted.join(',')}})`;
                });
                
                // Add decryptor at the beginning
                output = decryptor.code + '\n' + output;
            }

            // Rename local variables (simple approach)
            if (options.tier === 'standard' || options.tier === 'advanced') {
                const localPattern = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
                const renames = new Map();
                
                output = output.replace(localPattern, (match, varName) => {
                    // Skip common Lua globals
                    const skip = ['self', 'true', 'false', 'nil', '_G', '_VERSION'];
                    if (skip.includes(varName)) return match;
                    
                    if (!renames.has(varName)) {
                        renames.set(varName, this.generateVarName());
                    }
                    return `local ${renames.get(varName)}`;
                });
                
                // Replace variable usages
                renames.forEach((newName, oldName) => {
                    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
                    output = output.replace(regex, newName);
                });
            }

            // Add junk code for advanced tier
            if (options.tier === 'advanced') {
                const junkVars = [];
                for (let i = 0; i < 5; i++) {
                    const v = this.generateVarName();
                    junkVars.push(`local ${v}=${Math.floor(Math.random() * 1000)};`);
                }
                output = junkVars.join('') + '\n' + output;
            }

            // Minify (remove extra whitespace and comments)
            output = output
                .replace(/--\[\[[\s\S]*?\]\]/g, '') // Remove block comments
                .replace(/--[^\n]*/g, '')           // Remove line comments
                .replace(/\n\s*\n/g, '\n')          // Remove empty lines
                .replace(/\s+/g, ' ')               // Collapse whitespace
                .replace(/\s*([=+\-*\/,{}()\[\]])\s*/g, '$1'); // Remove space around operators

            return {
                success: true,
                code: output,
                time: Date.now() - startTime
            };
            
        } catch (error) {
            return {
                success: false,
                code: '',
                error: error.message,
                time: Date.now() - startTime
            };
        }
    }
}

module.exports = new LuaObfuscator();
