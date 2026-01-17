--[[
    Meson Obfuscator - Code Generator
    Converts AST back to Lua source code
]]

Generator = {}

local indent = 0
local output = {}

local function emit(str)
    table.insert(output, str)
end

local function emitIndent()
    emit(string.rep("    ", indent))
end

local function emitLine(str)
    if str then
        emitIndent()
        emit(str)
    end
    emit("\n")
end

-- Forward declarations
local generateNode
local generateExpression
local generateStatement
local generateBlock

-- Generate expression
generateExpression = function(node)
    if not node then return "nil" end
    
    local t = node.type
    
    if t == "Identifier" then
        return node.name
    
    elseif t == "NumericLiteral" then
        return tostring(node.value)
    
    elseif t == "StringLiteral" then
        -- Escape string
        local escaped = node.value
            :gsub("\\", "\\\\")
            :gsub("\n", "\\n")
            :gsub("\r", "\\r")
            :gsub("\t", "\\t")
            :gsub('"', '\\"')
        return '"' .. escaped .. '"'
    
    elseif t == "BooleanLiteral" then
        return node.value and "true" or "false"
    
    elseif t == "NilLiteral" then
        return "nil"
    
    elseif t == "VarargLiteral" then
        return "..."
    
    elseif t == "BinaryExpression" then
        local left = generateExpression(node.left)
        local right = generateExpression(node.right)
        return "(" .. left .. " " .. node.operator .. " " .. right .. ")"
    
    elseif t == "UnaryExpression" then
        local arg = generateExpression(node.argument)
        if node.operator == "not" then
            return "not " .. arg
        else
            return node.operator .. arg
        end
    
    elseif t == "LogicalExpression" then
        local left = generateExpression(node.left)
        local right = generateExpression(node.right)
        return "(" .. left .. " " .. node.operator .. " " .. right .. ")"
    
    elseif t == "MemberExpression" then
        local base = generateExpression(node.base)
        local id = node.identifier.name
        return base .. "." .. id
    
    elseif t == "IndexExpression" then
        local base = generateExpression(node.base)
        local index = generateExpression(node.index)
        return base .. "[" .. index .. "]"
    
    elseif t == "CallExpression" then
        local base = generateExpression(node.base)
        local args = {}
        for _, arg in ipairs(node.arguments or {}) do
            table.insert(args, generateExpression(arg))
        end
        return base .. "(" .. table.concat(args, ", ") .. ")"
    
    elseif t == "MethodCall" then
        local base = generateExpression(node.base)
        local id = node.identifier.name
        local args = {}
        for _, arg in ipairs(node.arguments or {}) do
            table.insert(args, generateExpression(arg))
        end
        return base .. ":" .. id .. "(" .. table.concat(args, ", ") .. ")"
    
    elseif t == "FunctionExpression" then
        local params = {}
        for _, p in ipairs(node.parameters or {}) do
            table.insert(params, p.name)
        end
        if node.isVararg then
            table.insert(params, "...")
        end
        
        local result = "function(" .. table.concat(params, ", ") .. ")\n"
        indent = indent + 1
        result = result .. generateBlock(node.body)
        indent = indent - 1
        emitIndent()
        result = result .. string.rep("    ", indent) .. "end"
        return result
    
    elseif t == "TableConstructor" then
        if #(node.fields or {}) == 0 then
            return "{}"
        end
        
        local fields = {}
        for _, field in ipairs(node.fields) do
            if field.type == "TableKey" then
                table.insert(fields, "[" .. generateExpression(field.key) .. "] = " .. generateExpression(field.value))
            elseif field.type == "TableKeyString" then
                table.insert(fields, field.key .. " = " .. generateExpression(field.value))
            elseif field.type == "TableValue" then
                table.insert(fields, generateExpression(field.value))
            end
        end
        
        return "{" .. table.concat(fields, ", ") .. "}"
    end
    
    return "nil --[[unknown: " .. tostring(t) .. "]]"
end

-- Generate statement
generateStatement = function(node)
    if not node then return end
    
    local t = node.type
    
    if t == "LocalStatement" then
        local vars = {}
        for _, v in ipairs(node.variables or {}) do
            table.insert(vars, v.name)
        end
        
        local result = "local " .. table.concat(vars, ", ")
        
        if node.init and #node.init > 0 then
            local inits = {}
            for _, i in ipairs(node.init) do
                table.insert(inits, generateExpression(i))
            end
            result = result .. " = " .. table.concat(inits, ", ")
        end
        
        emitLine(result)
    
    elseif t == "AssignmentStatement" then
        local vars = {}
        for _, v in ipairs(node.variables or {}) do
            table.insert(vars, generateExpression(v))
        end
        
        local inits = {}
        for _, i in ipairs(node.init or {}) do
            table.insert(inits, generateExpression(i))
        end
        
        emitLine(table.concat(vars, ", ") .. " = " .. table.concat(inits, ", "))
    
    elseif t == "CallStatement" then
        emitLine(generateExpression(node.expression))
    
    elseif t == "FunctionDeclaration" or t == "LocalFunction" then
        local prefix = t == "LocalFunction" and "local " or ""
        local name = generateExpression(node.identifier)
        
        local params = {}
        for _, p in ipairs(node.parameters or {}) do
            table.insert(params, p.name)
        end
        if node.isVararg then
            table.insert(params, "...")
        end
        
        emitLine(prefix .. "function " .. name .. "(" .. table.concat(params, ", ") .. ")")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("end")
    
    elseif t == "IfStatement" then
        for i, clause in ipairs(node.clauses) do
            local keyword = i == 1 and "if" or "elseif"
            emitLine(keyword .. " " .. generateExpression(clause.condition) .. " then")
            indent = indent + 1
            generateBlock(clause.body)
            indent = indent - 1
        end
        
        if node.elseBody and #node.elseBody > 0 then
            emitLine("else")
            indent = indent + 1
            generateBlock(node.elseBody)
            indent = indent - 1
        end
        
        emitLine("end")
    
    elseif t == "WhileStatement" then
        emitLine("while " .. generateExpression(node.condition) .. " do")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("end")
    
    elseif t == "DoStatement" then
        emitLine("do")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("end")
    
    elseif t == "ForNumericStatement" then
        local var = node.variable.name
        local start = generateExpression(node.start)
        local limit = generateExpression(node.limit)
        local step = node.step and (", " .. generateExpression(node.step)) or ""
        
        emitLine("for " .. var .. " = " .. start .. ", " .. limit .. step .. " do")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("end")
    
    elseif t == "ForGenericStatement" then
        local vars = {}
        for _, v in ipairs(node.variables or {}) do
            table.insert(vars, v.name)
        end
        
        local iters = {}
        for _, i in ipairs(node.iterators or {}) do
            table.insert(iters, generateExpression(i))
        end
        
        emitLine("for " .. table.concat(vars, ", ") .. " in " .. table.concat(iters, ", ") .. " do")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("end")
    
    elseif t == "RepeatStatement" then
        emitLine("repeat")
        indent = indent + 1
        generateBlock(node.body)
        indent = indent - 1
        emitLine("until " .. generateExpression(node.condition))
    
    elseif t == "ReturnStatement" then
        local args = {}
        for _, a in ipairs(node.arguments or {}) do
            table.insert(args, generateExpression(a))
        end
        
        if #args > 0 then
            emitLine("return " .. table.concat(args, ", "))
        else
            emitLine("return")
        end
    
    elseif t == "BreakStatement" then
        emitLine("break")
    
    elseif t == "ContinueStatement" then
        emitLine("continue")
    end
end

-- Generate block
generateBlock = function(body)
    local result = ""
    for _, stmt in ipairs(body or {}) do
        generateStatement(stmt)
    end
    return table.concat(output, "")
end

-- Main generate function
function Generator.generate(ast, options)
    options = options or {}
    indent = 0
    output = {}
    
    if ast.type == "Program" then
        generateBlock(ast.body)
    end
    
    local result = table.concat(output, "")
    
    -- Minify if requested
    if options.minify then
        -- Basic minification (remove extra whitespace)
        result = result:gsub("\n%s*\n", "\n")
        result = result:gsub("    ", " ")
    end
    
    return result
end

return Generator
