/**
 * Bytecode Encryptor - Encrypts compiled bytecode
 */

class BytecodeEncrypt {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Encrypt bytecode and constants
     */
    encrypt(compiled) {
        const key = Math.floor(Math.random() * 255) + 1;
        
        // Flatten bytecode to number array
        const bytecodeArray = [];
        for (const instr of compiled.bytecode) {
            // Encrypt opcode
            bytecodeArray.push((instr.op ^ key) & 0xFF);
            
            // Add arguments
            for (const arg of instr.args) {
                if (typeof arg === 'number') {
                    // Encode number as bytes
                    bytecodeArray.push((arg ^ key) & 0xFF);
                }
            }
        }

        // Add some random padding
        const paddingCount = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < paddingCount; i++) {
            const pos = Math.floor(Math.random() * bytecodeArray.length);
            // Insert NOP-like values that will be ignored
            bytecodeArray.splice(pos, 0, (0xFF ^ key) & 0xFF);
        }

        return {
            bytecode: bytecodeArray,
            constants: compiled.constants,
            key: key,
            numLocals: compiled.numLocals,
            numUpvals: compiled.numUpvals
        };
    }
}

module.exports = BytecodeEncrypt;
