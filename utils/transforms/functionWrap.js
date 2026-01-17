/**
 * Function Wrapping Transform
 * Membungkus fungsi global dalam local variable untuk menyembunyikan intent
 * 
 * Before: print("hello")
 * After:  local _f1 = print; _f1("hello")
 */

class FunctionWrap {
    constructor(obfuscator) {
        this.obf = obfuscator;
        this.wrappedFunctions = new Map();
        this.counter = 0;
    }

    /**
     * Generate wrapper variable name
     */
    generateWrapperName() {
        const styles = [
            () => '_f' + (this.counter++),
            () => '_w' + (this.counter++),
            () => '_' + String.fromCharCode(97 + (this.counter++ % 26)) + Math.floor(Math.random() * 10),
        ];
        return styles[Math.floor(Math.random() * styles.length)]();
    }

    /**
     * List of global functions to wrap
     */
    getWrappableFunctions() {
        return [
            'print', 'warn', 'error', 'assert', 'type', 'typeof',
            'pairs', 'ipairs', 'next', 'select', 'unpack',
            'pcall', 'xpcall', 'tonumber', 'tostring',
            'rawget', 'rawset', 'rawequal', 'setmetatable', 'getmetatable',
            'require', 'loadstring', 'load', 'getfenv', 'setfenv',
            'tick', 'time', 'wait', 'delay', 'spawn'
        ];
    }

    /**
     * Apply function wrapping
     */
    apply(code) {
        this.wrappedFunctions.clear();
        this.counter = 0;
        
        const wrappable = this.getWrappableFunctions();
        let result = code;
        
        // Find which functions are used
        const usedFunctions = [];
        for (const func of wrappable) {
            const pattern = new RegExp('\\b' + func + '\\s*\\(', 'g');
            if (pattern.test(code)) {
                usedFunctions.push(func);
            }
        }
        
        // Create wrappers only for used functions
        const wrapperDeclarations = [];
        for (const func of usedFunctions) {
            // 80% chance to wrap each function
            if (Math.random() > 0.8) continue;
            
            const wrapperName = this.generateWrapperName();
            this.wrappedFunctions.set(func, wrapperName);
            wrapperDeclarations.push('local ' + wrapperName + '=' + func);
        }
        
        // Replace function calls with wrapper calls
        this.wrappedFunctions.forEach((wrapperName, originalName) => {
            // Match function calls (not declarations or method calls)
            const pattern = new RegExp('(?<![.:])\\b' + originalName + '\\s*\\(', 'g');
            result = result.replace(pattern, wrapperName + '(');
        });
        
        // Add wrapper declarations at the beginning
        if (wrapperDeclarations.length > 0) {
            result = wrapperDeclarations.join(';') + ';' + result;
        }
        
        return result;
    }
}

module.exports = FunctionWrap;
