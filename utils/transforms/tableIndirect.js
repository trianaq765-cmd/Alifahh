/**
 * Table Indirection Transform
 * Mengakses nilai melalui table lookup daripada langsung
 * 
 * Before: game:GetService("Players")
 * After:  _T[1][_T[2]](_T[1], _T[3])
 *         where _T = {game, "GetService", "Players"}
 */

class TableIndirect {
    constructor(obfuscator) {
        this.obf = obfuscator;
        this.tableEntries = [];
        this.tableName = '_T' + Math.floor(Math.random() * 100);
    }

    /**
     * Add entry to indirection table
     */
    addEntry(value, isString = false) {
        const index = this.tableEntries.length + 1;
        if (isString) {
            this.tableEntries.push('"' + value + '"');
        } else {
            this.tableEntries.push(value);
        }
        return this.tableName + '[' + index + ']';
    }

    /**
     * Apply table indirection to service calls
     */
    apply(code) {
        this.tableEntries = [];
        let result = code;
        
        // Pattern for game:GetService("ServiceName")
        const servicePattern = /game\s*:\s*GetService\s*\(\s*["']([^"']+)["']\s*\)/g;
        
        result = result.replace(servicePattern, (match, serviceName) => {
            // 60% chance to apply
            if (Math.random() > 0.6) return match;
            
            const gameRef = this.addEntry('game');
            const methodRef = this.addEntry('GetService', true);
            const serviceRef = this.addEntry(serviceName, true);
            
            return gameRef + '[' + methodRef + '](' + gameRef + ',' + serviceRef + ')';
        });
        
        // Pattern for workspace access
        const workspacePattern = /\bworkspace\b(?!\s*[=\[])/g;
        let workspaceRef = null;
        
        result = result.replace(workspacePattern, (match) => {
            // 40% chance to apply
            if (Math.random() > 0.4) return match;
            
            if (!workspaceRef) {
                workspaceRef = this.addEntry('workspace');
            }
            return workspaceRef;
        });
        
        // Build table declaration
        if (this.tableEntries.length > 0) {
            const tableDecl = 'local ' + this.tableName + '={' + this.tableEntries.join(',') + '};';
            result = tableDecl + result;
        }
        
        return result;
    }
}

module.exports = TableIndirect;
