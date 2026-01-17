--[[
    Meson Obfuscator - Main Module
    Entry point for testing Lexer and Parser
]]

-- Load modules (adjust paths as needed)
local Utils = {} -- Paste Utils code here
local Lexer = {} -- Paste Lexer code here
local AST = {}   -- Paste AST code here  
local Parser = {} -- Paste Parser code here

-- ==================== INLINE MODULES ====================
-- (For testing, paste all module code here)

-- [PASTE Utils MODULE HERE]
-- [PASTE Lexer MODULE HERE]
-- [PASTE AST MODULE HERE]
-- [PASTE Parser MODULE HERE]

-- ==================== TEST CODE ====================

local testCode = [[
-- ULTIMATE HUB LOADER V10.3 (NO KEY SYSTEM)
if getgenv().UHLoaded then
    pcall(function() getgenv().UH:Destroy() end)
    pcall(function() game:GetService("CoreGui"):FindFirstChild("Rayfield"):Destroy() end)
    getgenv().UH, getgenv().UHCore, getgenv().UHLoaded = nil, nil, nil
    task.wait(0.3)
end
getgenv().UHLoaded = true

print("=== ULTIMATE HUB LOADER V10.3 STARTING ===")

local CFG = {
    CU = "https://pastebin.com/raw/hRnCQzUq",
}

local HS, TS, PL, CG, SG = game:GetService("HttpService"), game:GetService("TweenService"), game:GetService("Players"), game:GetService("CoreGui"), game:GetService("StarterGui")
local LP = PL.LocalPlayer

local function SN(t, x, d) 
    pcall(function() 
        SG:SetCore("SendNotification", {Title = t or "Ultimate Hub", Text = x or "", Duration = d or 5}) 
    end) 
end

local function LH()
    print("=== LOADING HUB ===")
    
    local C = getgenv().UHCore
    if not C then
        print("=== LOADING CORE FROM URL ===")
        local success, err = pcall(function() loadstring(game:HttpGet(CFG.CU))() end)
        if not success then 
            warn("Core Load Error:", err)
            SN("Ultimate Hub", "Failed to load core!", 5)
            return 
        end
        task.wait(0.5)
        C = getgenv().UHCore
    end
end

LH()
]]

-- ==================== RUN TEST ====================

print("\n" .. string.rep("=", 70))
print("                    MESON OBFUSCATOR - LEXER & PARSER TEST")
print(string.rep("=", 70))

-- Step 1: Tokenize
print("\n[STEP 1] LEXING...")
local lexer = Lexer.new(testCode)
local tokens, lexErrors = lexer:tokenize()

print(string.format("✓ Generated %d tokens", #tokens))

if #lexErrors > 0 then
    print("⚠ Lexer Errors:")
    for _, err in ipairs(lexErrors) do
        print(string.format("  Line %d, Col %d: %s", err.line, err.column, err.message))
    end
end

-- Print first 30 tokens as sample
print("\n[SAMPLE TOKENS] (First 30)")
print(string.rep("-", 60))
for i = 1, math.min(30, #tokens) do
    local t = tokens[i]
    local val = type(t.value) == "string" and ('"' .. t.value:sub(1,20) .. '"') or tostring(t.value)
    print(string.format("[%2d] %-18s %-25s L:%d C:%d", 
        i, t.type, val:sub(1,25), t.line, t.column))
end
print(string.rep("-", 60))

-- Step 2: Parse
print("\n[STEP 2] PARSING...")
local parser = Parser.new(tokens)
parser:loadDependencies(AST, Lexer)
local ast, parseErrors = parser:parse()

print(string.format("✓ Generated AST with %d top-level nodes", #ast.body))

if #parseErrors > 0 then
    print("⚠ Parser Errors:")
    for _, err in ipairs(parseErrors) do
        print(string.format("  Line %d: %s", err.line or 0, err.message))
    end
end

-- Print AST structure
print("\n[AST STRUCTURE] (Top-level nodes)")
print(string.rep("-", 60))
for i, node in ipairs(ast.body) do
    local info = node.type
    
    if node.type == "LocalStatement" then
        local vars = {}
        for _, v in ipairs(node.variables or {}) do
            table.insert(vars, v.name or "?")
        end
        info = info .. " [" .. table.concat(vars, ", ") .. "]"
    elseif node.type == "FunctionDeclaration" or node.type == "LocalFunction" then
        local name = node.identifier and node.identifier.name or "?"
        if node.identifier and node.identifier.type == "MemberExpression" then
            name = "(member)"
        end
        info = info .. " [" .. name .. "]"
    elseif node.type == "IfStatement" then
        info = info .. " [" .. #node.clauses .. " clauses]"
    elseif node.type == "CallStatement" then
        local base = node.expression and node.expression.base
        if base and base.name then
            info = info .. " [" .. base.name .. "()]"
        end
    end
    
    print(string.format("[%2d] %s", i, info))
end
print(string.rep("-", 60))

-- Print full AST (optional - very verbose)
print("\n[FULL AST] (First node only)")
print(string.rep("-", 60))
if ast.body[1] then
    print(Utils.prettyPrint(ast.body[1]))
end
print(string.rep("-", 60))

print("\n" .. string.rep("=", 70))
print("                         TEST COMPLETE!")
print(string.rep("=", 70))

-- Return modules for external use
return {
    Utils = Utils,
    Lexer = Lexer,
    AST = AST,
    Parser = Parser
}
