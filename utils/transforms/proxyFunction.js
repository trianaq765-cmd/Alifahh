/**
 * Proxy Function Transform
 * Membuat fungsi perantara yang memanggil fungsi asli
 * 
 * Before: print("hello")
 * After:  _px1(print, "hello")
 *         where _px1 = function(f, ...) return f(...) end
 */

class ProxyFunction {
    constructor(obfuscator) {
        this.obf = obfuscator;
        this.proxyName = null;
        this.proxyGenerated = false;
    }

    /**
     * Generate proxy function name
     */
    generateProxyName() {
        const prefixes = ['_px', '_pr', '_fn', '_ex', '_ca'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + Math.floor(Math.random() * 100);
    }

    /**
     * Build proxy function declaration
     */
    buildProxyDeclaration() {
        const f = '_f';
        const args = '...';
        
        // Different proxy styles
        const styles = [
            // Simple proxy
            'local ' + this.proxyName + '=function(' + f + ',' + args + ')return ' + f + '(' + args + ')end',
            // With pcall check
            'local ' + this.proxyName + '=function(' + f + ',' + args + ')local _s,_r=pcall(' + f + ',' + args + ')if _s then return _r end end',
            // Double wrapped
            'local ' + this.proxyName + ';do local _w=function(_f,...)return _f(...)end;' + this.proxyName + '=function(_g,...)return _w(_g,...)end end',
        ];
        
        return styles[Math.floor(Math.random() * styles.length)];
    }

    /**
     * Apply proxy wrapping to function calls
     */
    apply(code) {
        this.proxyName = this.generateProxyName();
        this.proxyGenerated = false;
        let result = code;
        
        // Target functions for proxy wrapping
        const targetFuncs = ['print', 'warn', 'error', 'assert', 'pcall', 'xpcall', 'loadstring', 'require'];
        
        let hasProxy = false;
        
        for (const func of targetFuncs) {
            // Match function calls
            const pattern = new RegExp('\\b' + func + '\\s*\\(([^)]*(?:\\([^)]*\\)[^)]*)*)\\)', 'g');
            
            result = result.replace(pattern, (match, args) => {
                // 50% chance to wrap
                if (Math.random() > 0.5) return match;
                
                hasProxy = true;
                return this.proxyName + '(' + func + ',' + args + ')';
            });
        }
        
        // Add proxy declaration if needed
        if (hasProxy) {
            result = this.buildProxyDeclaration() + ';' + result;
        }
        
        return result;
    }
}

module.exports = ProxyFunction;
