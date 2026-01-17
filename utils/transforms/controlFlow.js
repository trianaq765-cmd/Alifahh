/**
 * Control Flow Flattening Transform
 * Wraps code blocks in while-switch dispatchers
 */

class ControlFlow {
    constructor(obfuscator) {
        this.obf = obfuscator;
    }

    /**
     * Generate state variable and dispatcher
     */
    generateDispatcher(blocks) {
        const stateVar = this.obf.generateName();
        const states = blocks.map((_, i) => i + 1);
        
        // Shuffle states
        for (let i = states.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [states[i], states[j]] = [states[j], states[i]];
        }

        return { stateVar, states };
    }

    /**
     * Apply control flow flattening
     * Note: This is a simplified version that adds dispatcher wrappers
     */
    apply(code) {
        // For safety, we'll add a simpler obfuscation:
        // Wrap the entire code in a protected call with state machine

        const stateVar = this.obf.generateName();
        const funcVar = this.obf.generateName();
        const resultVar = this.obf.generateName();
        
        // Create a wrapper that makes decompilation harder
        const wrapper = `
local ${stateVar}=1;
local ${funcVar}={};
${funcVar}[1]=function()
${code}
${stateVar}=0;
end;
while ${stateVar}>0 do
local ${resultVar}=${funcVar}[${stateVar}];
if ${resultVar} then ${resultVar}()end;
end;
`;
        return wrapper;
    }
}

module.exports = ControlFlow;
