/**
 * Meson Obfuscator v2.0 - Advanced Lua Obfuscator
 * Fixed version - no reserved words
 */

class MesonObfuscator {
    constructor() {
        this.reset();
    }

    reset() {
        this.varCounter = 0;
        this.funcCounter = 0;
        this.usedNames = new Set();
        this.stringKey = Math.floor(Math.random() * 200) + 50;
    }

    /**
     * Generate unique obfuscated name
     */
    generateName(prefix = '_') {
        const styles = [
            () => '_0x' + Math.random().toString(16).substr(2, 6),
            () => {
                let name = '_';
                for (let i = 0; i < 8; i++) {
                    name += ['I', 'l', '1'][Math.floor(Math.random() * 3)];
                }
                return name;
            },
            () => '_v' + (this.varCounter++) + '_' + Math.random().toString(36).substr(2, 4),
            () => {
                let name = '_';
                for (let i = 0; i < 6; i++) {
                    name += ['O', 'o', '0'][Math.floor(Math.random() * 3)];
                }
                return name + this.varCounter++;
            }
        ];

        let name;
        do {
            const style = styles[Math.floor(Math.random() * styles.length)];
            name = style();
        } while (this.usedNames.has(name));

        this.usedNames.add(name);
        return name;
    }

    /**
     * Protected names that should never be renamed
     */
    getProtectedNames() {
        return new Set([
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or',
            'repeat', 'return', 'then', 'true', 'until', 'while', 'continue',
            'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs',
            'ipairs', 'next', 'select', 'unpack', 'pcall', 'xpcall',
            'tonumber', 'tostring', 'rawget', 'rawset', 'rawequal',
            'setmetatable', 'getmetatable', 'require', 'loadstring',
            'string', 'table', 'math', 'bit32', 'bit', 'coroutine', 'debug',
            'os', 'io', 'utf8', 'game', 'workspace', 'script', 'shared',
            'tick', 'time', 'wait', 'delay', 'spawn', 'task',
            'getfenv', 'setfenv', 'getgenv', 'getrenv', 'getsenv',
            'Instance', 'Vector2', 'Vector3', 'CFrame', 'Color3', 'BrickColor',
            'UDim', 'UDim2', 'Ray', 'Region3', 'TweenInfo', 'Enum',
            'getrawmetatable', 'setrawmetatable', 'hookfunction', 'newcclosure',
            'Drawing', 'setclipboard', 'self', '_G', '_VERSION'
        ]);
    }

    /**
     * Generate decoder function for strings
     */
    generateDecoder() {
        const funcName = this.generateName();
        const keyVar = this.generateName();
        const decoder = `local ${funcName};do local ${keyVar}=${this.stringKey};${funcName}=function(e)local r=""for i=1,#e do r=r..string.char((bit32 and bit32.bxor or function(a,b)local p,c=1,0;while a>0 and b>0 do local ra,rb=a%2,b%2;if ra~=rb then c=c+p end;a,b,p=(a-ra)/2,(b-rb)/2,p*2 end;if a<b then a=b end;while a>0 do local ra=a%2;if ra>0 then c=c+p end;a,p=(a-ra)/2,p*2 end;return c end)(e[i],${keyVar}))end return r end end;`;
        return { name: funcName, code: decoder };
    }

    /**
     * Encrypt string to byte array
     */
    encryptString(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ this.stringKey);
        }
        return bytes;
    }

    /**
     * Check if string should be encrypted
     */
    shouldEncryptString(content) {
        if (content.length < 3) return false;
        if (content.includes('\\')) return false;
        if (content.includes('%s') || content.includes('%d')) return false;
        return true;
    }

    /**
     * Apply string encryption
     */
    applyStringEncryption(code) {
        const decoder = this.generateDecoder();
        let result = code;

        const stringPattern = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
        
        result = result.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            if (!this.shouldEncryptString(content)) {
                return match;
            }

            const encrypted = this.encryptString(content);
            return `${decoder.name}({${encrypted.join(',')}})`;
        });

        return decoder.code + result;
    }

    /**
     * Encode number as math expression
     */
    encodeNumber(num) {
        const methods = [
            () => {
                const a = Math.floor(Math.random() * 1000);
                return `(${a}+${num - a})`;
            },
            () => {
                const a = num + Math.floor(Math.random() * 1000);
                return `(${a}-${a - num})`;
            },
            () => {
                const factors = [2, 3, 5];
                for (const f of factors) {
                    if (num % f === 0 && num !== 0) {
                        return `(${num / f}*${f})`;
                    }
                }
                const a = Math.floor(Math.random() * 100);
                return `(${a}+${num - a})`;
            },
            () => {
                const a = Math.floor(Math.random() * 50);
                const b = Math.floor(Math.random() * 50);
                return `((${num + a + b}-${a})-${b})`;
            }
        ];

        return methods[Math.floor(Math.random() * methods.length)]();
    }

    /**
     * Apply number encoding
     */
    applyNumberEncoding(code) {
        const numberPattern = /(?<![.\w])(\d+)(?![.\dxX])/g;
        
        return code.replace(numberPattern, (match, num) => {
            const n = parseInt(num);
            if (n < 2 || n > 99999) return match;
            if (Math.random() > 0.5) return match;
            return this.encodeNumber(n);
        });
    }

    /**
     * Rename local variables
     */
    renameVariables(code) {
        const protectedNames = this.getProtectedNames();
        const renames = new Map();

        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;

        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!protectedNames.has(varName) && !renames.has(varName)) {
                renames.set(varName, this.generateName());
            }
        }

        const funcPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p && p !== '...');
            for (const param of params) {
                if (!protectedNames.has(param) && !renames.has(param)) {
                    renames.set(param, this.generateName());
                }
            }
        }

        let result = code;
        renames.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            result = result.replace(regex, newName);
        });

        return result;
    }

    /**
     * Generate dead code
     */
    generateDeadCode() {
        const snippets = [];
        const count = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < count; i++) {
            const v = this.generateName();
            const type = Math.floor(Math.random() * 4);
            
            switch (type) {
                case 0:
                    snippets.push(`local ${v}=${Math.floor(Math.random() * 10000)};`);
                    break;
                case 1:
                    snippets.push(`local ${v}=function()return nil end;`);
                    break;
                case 2:
                    const a = Math.floor(Math.random() * 100) + 100;
                    snippets.push(`local ${v}=nil;if ${a}>${a + 50} then ${v}=1 end;`);
                    break;
                case 3:
                    snippets.push(`local ${v}={};`);
                    break;
            }
        }

        return snippets.join('');
    }

    /**
     * Generate opaque predicate (always true)
     */
    generateOpaquePredicate() {
        const predicates = [
            () => {
                const n = Math.floor(Math.random() * 100) + 1;
                return `(${n}*${n}>=${n})`;
            },
            () => `(type("")=="string")`,
            () => `(type({})=="table")`,
            () => `(#""==0)`,
            () => {
                const a = Math.floor(Math.random() * 50);
                const b = a + Math.floor(Math.random() * 50) + 1;
                return `(${b}>${a})`;
            }
        ];

        return predicates[Math.floor(Math.random() * predicates.length)]();
    }

    /**
     * Apply opaque predicates
     */
    applyOpaquePredicates(code) {
        const checkVar = this.generateName();
        const predicate = this.generateOpaquePredicate();
        return `local ${checkVar}=${predicate};if not ${checkVar} then return end;` + code;
    }

    /**
     * Apply control flow wrapper
     */
    applyControlFlow(code) {
        const stateVar = this.generateName();
        const funcVar = this.generateName();
        
        return `local ${stateVar}=1;local ${funcVar}={[1]=function()${code};${stateVar}=0 end};while ${stateVar}>0 do if ${funcVar}[${stateVar}]then ${funcVar}[${stateVar}]()end end;`;
    }

    /**
     * Remove comments
     */
    removeComments(code) {
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        code = code.replace(/--[^\n]*/g, '');
        return code;
    }

    /**
     * Minify code
     */
    minify(code) {
        let result = code;
        result = result.split('\n').filter(line => line.trim()).join('\n');
        result = result.replace(/\n/g, ' ');
        result = result.replace(/\s+/g, ' ');
        result = result.replace(/\s*([{}()\[\],;])\s*/g, '$1');
        result = result.replace(/\b(and|or|not|then|do|end|else|elseif|in|local|function|return|if|while|for|repeat|until)\b/g, ' $1 ');
        result = result.replace(/\s+/g, ' ').trim();
        return result;
    }

    /**
     * Main obfuscation function
     */
    async obfuscate(sourceCode, options = {}) {
        const startTime = Date.now();
        this.reset();

        try {
            const tier = options.tier || 'basic';
            let code = sourceCode;

            // Remove comments
            code = this.removeComments(code);

            // Apply obfuscation based on tier
            if (tier === 'basic') {
                code = this.applyStringEncryption(code);
            } 
            else if (tier === 'standard') {
                code = this.applyStringEncryption(code);
                code = this.applyNumberEncoding(code);
                code = this.renameVariables(code);
            } 
            else if (tier === 'advanced') {
                code = this.generateDeadCode() + code;
                code = this.applyStringEncryption(code);
                code = this.applyNumberEncoding(code);
                code = this.applyOpaquePredicates(code);
                code = this.renameVariables(code);
                code = this.applyControlFlow(code);
            }

            // Minify
            code = this.minify(code);

            // Add watermark
            code = `--[[ Meson Obfuscator ]]` + code;

            return {
                success: true,
                code: code,
                time: Date.now() - startTime,
                tier: tier
            };

        } catch (error) {
            console.error('[Obfuscator Error]', error);
            return {
                success: false,
                code: '',
                error: error.message,
                time: Date.now() - startTime
            };
        }
    }
}

module.exports = new MesonObfuscator();
