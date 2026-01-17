--[[
    Meson Obfuscator - Main Module
    Placeholder until transformations are complete
]]

Obfuscator = {}

function Obfuscator.obfuscate(source, options)
    options = options or {}
    
    -- Initialize modules (these should be loaded already)
    local Utils = Utils or {}
    local Lexer = Lexer or {}
    local AST = AST or {}
    local Parser = Parser or {}
    local Generator = Generator or {}
    
    -- Step 1: Tokenize
    local lexer = Lexer.new(source)
    local tokens, lexErrors = lexer:tokenize()
    
    if #lexErrors > 0 then
        error("Lexer error: " .. lexErrors[1].message)
    end
    
    -- Step 2: Parse
    local parser = Parser.new(tokens)
    parser:loadDependencies(AST, Lexer)
    local ast, parseErrors = parser:parse()
    
    if #parseErrors > 0 then
        error("Parser error: " .. parseErrors[1].message)
    end
    
    -- Step 3: Transform (TODO - implement transforms)
    -- For now, just regenerate code
    
    -- Step 4: Generate
    local output = Generator.generate(ast, options)
    
    return output
end

return Obfuscator
