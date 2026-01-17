--[[
    Meson Obfuscator - Parser Module
    Converts tokens into Abstract Syntax Tree (AST)
    
    Supports full Lua 5.1 + Roblox Lua syntax
]]

local AST = {} -- Will be loaded
local Lexer = {} -- Will be loaded

local Parser = {}
Parser.__index = Parser

-- Operator Precedence (higher = binds tighter)
Parser.Precedence = {
    ["or"] = 1,
    ["and"] = 2,
    ["<"] = 3, [">"] = 3, ["<="] = 3, [">="] = 3, ["~="] = 3, ["=="] = 3,
    [".."] = 4,
    ["+"] = 5, ["-"] = 5,
    ["*"] = 6, ["/"] = 6, ["%"] = 6,
    ["not"] = 7, ["#"] = 7, ["-unary"] = 7,
    ["^"] = 8,
}

-- Right associative operators
Parser.RightAssoc = {
    [".."] = true,
    ["^"] = true,
}

-- Unary operators
Parser.UnaryOps = {
    ["-"] = true,
    ["not"] = true,
    ["#"] = true,
}

-- Create new Parser
function Parser.new(tokens)
    local self = setmetatable({}, Parser)
    self.tokens = tokens
    self.current = 1
    self.errors = {}
    return self
end

-- Load dependencies
function Parser:loadDependencies(astModule, lexerModule)
    AST = astModule
    Lexer = lexerModule
end

-- Check if at end
function Parser:isAtEnd()
    return self:peek().type == Lexer.TokenType.EOF
end

-- Get current token
function Parser:peek()
    return self.tokens[self.current] or {type = Lexer.TokenType.EOF}
end

-- Get previous token
function Parser:previous()
    return self.tokens[self.current - 1]
end

-- Look ahead
function Parser:peekNext()
    return self.tokens[self.current + 1] or {type = Lexer.TokenType.EOF}
end

-- Advance to next token
function Parser:advance()
    if not self:isAtEnd() then
        self.current = self.current + 1
    end
    return self:previous()
end

-- Check current token type
function Parser:check(tokenType, value)
    if self:isAtEnd() then return false end
    local token = self:peek()
    if token.type ~= tokenType then return false end
    if value and token.value ~= value then return false end
    return true
end

-- Match and consume token
function Parser:match(tokenType, value)
    if self:check(tokenType, value) then
        self:advance()
        return true
    end
    return false
end

-- Expect token or error
function Parser:expect(tokenType, value, message)
    if self:check(tokenType, value) then
        return self:advance()
    end
    self:error(message or ("Expected " .. tokenType .. (value and (" '" .. value .. "'") or "")))
    return nil
end

-- Report error
function Parser:error(message)
    local token = self:peek()
    table.insert(self.errors, {
        message = message,
        token = token,
        line = token.line,
        column = token.column
    })
    -- For now, just continue parsing
end

-- ==================== PARSING RULES ====================

-- Parse program
function Parser:parse()
    local body = {}
    
    while not self:isAtEnd() do
        local stmt = self:parseStatement()
        if stmt then
            table.insert(body, stmt)
        else
            -- Skip problematic token
            self:advance()
        end
    end
    
    return AST.Program(body), self.errors
end

-- Parse statement
function Parser:parseStatement()
    -- Local statement
    if self:check(Lexer.TokenType.KEYWORD, "local") then
        return self:parseLocalStatement()
    end
    
    -- Function declaration
    if self:check(Lexer.TokenType.KEYWORD, "function") then
        return self:parseFunctionDeclaration(false)
    end
    
    -- If statement
    if self:check(Lexer.TokenType.KEYWORD, "if") then
        return self:parseIfStatement()
    end
    
    -- While statement
    if self:check(Lexer.TokenType.KEYWORD, "while") then
        return self:parseWhileStatement()
    end
    
    -- Do statement
    if self:check(Lexer.TokenType.KEYWORD, "do") then
        return self:parseDoStatement()
    end
    
    -- For statement
    if self:check(Lexer.TokenType.KEYWORD, "for") then
        return self:parseForStatement()
    end
    
    -- Repeat statement
    if self:check(Lexer.TokenType.KEYWORD, "repeat") then
        return self:parseRepeatStatement()
    end
    
    -- Return statement
    if self:check(Lexer.TokenType.KEYWORD, "return") then
        return self:parseReturnStatement()
    end
    
    -- Break statement
    if self:check(Lexer.TokenType.KEYWORD, "break") then
        self:advance()
        return AST.BreakStatement()
    end
    
    -- Continue statement (Roblox)
    if self:check(Lexer.TokenType.KEYWORD, "continue") then
        self:advance()
        return AST.ContinueStatement()
    end
    
    -- Label ::name::
    if self:check(Lexer.TokenType.DOUBLE_COLON) then
        return self:parseLabelStatement()
    end
    
    -- Expression or Assignment
    return self:parseExpressionStatement()
end

-- Parse local statement
function Parser:parseLocalStatement()
    self:advance() -- consume 'local'
    
    -- local function
    if self:check(Lexer.TokenType.KEYWORD, "function") then
        return self:parseFunctionDeclaration(true)
    end
    
    -- local variables
    local variables = {}
    
    repeat
        if not self:check(Lexer.TokenType.IDENTIFIER) then
            self:error("Expected identifier")
            break
        end
        table.insert(variables, AST.Identifier(self:advance().value))
    until not self:match(Lexer.TokenType.COMMA)
    
    local init = {}
    if self:match(Lexer.TokenType.EQUAL) then
        repeat
            table.insert(init, self:parseExpression())
        until not self:match(Lexer.TokenType.COMMA)
    end
    
    return AST.LocalStatement(variables, init)
end

-- Parse function declaration
function Parser:parseFunctionDeclaration(isLocal)
    self:advance() -- consume 'function'
    
    -- Parse function name (can be a.b.c or a:b)
    local base
    if self:check(Lexer.TokenType.IDENTIFIER) then
        base = AST.Identifier(self:advance().value)
    else
        self:error("Expected function name")
        base = AST.Identifier("_error_")
    end
    
    local identifier = base
    local isMethod = false
    
    -- Handle member access a.b.c
    while self:match(Lexer.TokenType.DOT) do
        if self:check(Lexer.TokenType.IDENTIFIER) then
            identifier = AST.MemberExpression(identifier, AST.Identifier(self:advance().value))
        end
    end
    
    -- Handle method a:b
    if self:match(Lexer.TokenType.COLON) then
        isMethod = true
        if self:check(Lexer.TokenType.IDENTIFIER) then
            identifier = AST.MemberExpression(identifier, AST.Identifier(self:advance().value))
        end
    end
    
    -- Parameters
    self:expect(Lexer.TokenType.LEFT_PAREN, nil, "Expected '(' after function name")
    local params, isVararg = self:parseParameterList()
    self:expect(Lexer.TokenType.RIGHT_PAREN, nil, "Expected ')' after parameters")
    
    -- If method, add implicit 'self'
    if isMethod then
        table.insert(params, 1, AST.Identifier("self"))
    end
    
    -- Body
    local body = self:parseBlock()
    self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close function")
    
    local func = AST.FunctionDeclaration(identifier, params, body, isLocal)
    func.isVararg = isVararg
    return func
end

-- Parse parameter list
function Parser:parseParameterList()
    local params = {}
    local isVararg = false
    
    if not self:check(Lexer.TokenType.RIGHT_PAREN) then
        repeat
            if self:check(Lexer.TokenType.DOT_DOT_DOT) then
                self:advance()
                isVararg = true
                break
            elseif self:check(Lexer.TokenType.IDENTIFIER) then
                table.insert(params, AST.Identifier(self:advance().value))
            else
                break
            end
        until not self:match(Lexer.TokenType.COMMA)
    end
    
    return params, isVararg
end

-- Parse block (list of statements)
function Parser:parseBlock()
    local body = {}
    
    while not self:isAtEnd() and not self:isBlockEnd() do
        local stmt = self:parseStatement()
        if stmt then
            table.insert(body, stmt)
        end
    end
    
    return body
end

-- Check if at block end
function Parser:isBlockEnd()
    return self:check(Lexer.TokenType.KEYWORD, "end") or
           self:check(Lexer.TokenType.KEYWORD, "else") or
           self:check(Lexer.TokenType.KEYWORD, "elseif") or
           self:check(Lexer.TokenType.KEYWORD, "until")
end

-- Parse if statement
function Parser:parseIfStatement()
    self:advance() -- consume 'if'
    
    local clauses = {}
    
    -- First clause
    local condition = self:parseExpression()
    self:expect(Lexer.TokenType.KEYWORD, "then", "Expected 'then' after if condition")
    local body = self:parseBlock()
    table.insert(clauses, {condition = condition, body = body})
    
    -- Elseif clauses
    while self:match(Lexer.TokenType.KEYWORD, "elseif") do
        condition = self:parseExpression()
        self:expect(Lexer.TokenType.KEYWORD, "then", "Expected 'then' after elseif condition")
        body = self:parseBlock()
        table.insert(clauses, {condition = condition, body = body})
    end
    
    -- Else clause
    local elseBody = nil
    if self:match(Lexer.TokenType.KEYWORD, "else") then
        elseBody = self:parseBlock()
    end
    
    self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close if statement")
    
    return AST.IfStatement(clauses, elseBody)
end

-- Parse while statement
function Parser:parseWhileStatement()
    self:advance() -- consume 'while'
    local condition = self:parseExpression()
    self:expect(Lexer.TokenType.KEYWORD, "do", "Expected 'do' after while condition")
    local body = self:parseBlock()
    self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close while loop")
    return AST.WhileStatement(condition, body)
end

-- Parse do statement
function Parser:parseDoStatement()
    self:advance() -- consume 'do'
    local body = self:parseBlock()
    self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close do block")
    return AST.DoStatement(body)
end

-- Parse for statement
function Parser:parseForStatement()
    self:advance() -- consume 'for'
    
    local firstName = self:expect(Lexer.TokenType.IDENTIFIER, nil, "Expected variable name")
    
    if self:match(Lexer.TokenType.EQUAL) then
        -- Numeric for: for i = start, limit, step do
        local start = self:parseExpression()
        self:expect(Lexer.TokenType.COMMA, nil, "Expected ',' after for start")
        local limit = self:parseExpression()
        local step = nil
        if self:match(Lexer.TokenType.COMMA) then
            step = self:parseExpression()
        end
        self:expect(Lexer.TokenType.KEYWORD, "do", "Expected 'do' in for loop")
        local body = self:parseBlock()
        self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close for loop")
        
        return AST.ForNumericStatement(
            AST.Identifier(firstName.value),
            start, limit, step, body
        )
    else
        -- Generic for: for k, v in iterator do
        local variables = {AST.Identifier(firstName.value)}
        
        while self:match(Lexer.TokenType.COMMA) do
            local name = self:expect(Lexer.TokenType.IDENTIFIER, nil, "Expected variable name")
            table.insert(variables, AST.Identifier(name.value))
        end
        
        self:expect(Lexer.TokenType.KEYWORD, "in", "Expected 'in' in for loop")
        
        local iterators = {}
        repeat
            table.insert(iterators, self:parseExpression())
        until not self:match(Lexer.TokenType.COMMA)
        
        self:expect(Lexer.TokenType.KEYWORD, "do", "Expected 'do' in for loop")
        local body = self:parseBlock()
        self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close for loop")
        
        return AST.ForGenericStatement(variables, iterators, body)
    end
end

-- Parse repeat statement
function Parser:parseRepeatStatement()
    self:advance() -- consume 'repeat'
    local body = self:parseBlock()
    self:expect(Lexer.TokenType.KEYWORD, "until", "Expected 'until' to close repeat")
    local condition = self:parseExpression()
    return AST.RepeatStatement(body, condition)
end

-- Parse return statement
function Parser:parseReturnStatement()
    self:advance() -- consume 'return'
    
    local arguments = {}
    
    -- Check if there are return values
    if not self:isAtEnd() and not self:isBlockEnd() and 
       not self:check(Lexer.TokenType.SEMICOLON) then
        repeat
            table.insert(arguments, self:parseExpression())
        until not self:match(Lexer.TokenType.COMMA)
    end
    
    self:match(Lexer.TokenType.SEMICOLON) -- optional semicolon
    
    return AST.ReturnStatement(arguments)
end

-- Parse expression statement (call or assignment)
function Parser:parseExpressionStatement()
    local expr = self:parsePrefixExpression()
    
    if not expr then
        return nil
    end
    
    -- Check for assignment
    if self:check(Lexer.TokenType.EQUAL) or self:check(Lexer.TokenType.COMMA) or
       self:check(Lexer.TokenType.PLUS_EQUAL) or self:check(Lexer.TokenType.MINUS_EQUAL) or
       self:check(Lexer.TokenType.STAR_EQUAL) or self:check(Lexer.TokenType.SLASH_EQUAL) then
        
        local variables = {expr}
        
        while self:match(Lexer.TokenType.COMMA) do
            table.insert(variables, self:parsePrefixExpression())
        end
        
        -- Compound assignment (Roblox)
        local compoundOp = nil
        if self:match(Lexer.TokenType.PLUS_EQUAL) then compoundOp = "+"
        elseif self:match(Lexer.TokenType.MINUS_EQUAL) then compoundOp = "-"
        elseif self:match(Lexer.TokenType.STAR_EQUAL) then compoundOp = "*"
        elseif self:match(Lexer.TokenType.SLASH_EQUAL) then compoundOp = "/"
        else
            self:expect(Lexer.TokenType.EQUAL, nil, "Expected '=' in assignment")
        end
        
        local init = {}
        repeat
            table.insert(init, self:parseExpression())
        until not self:match(Lexer.TokenType.COMMA)
        
        if compoundOp then
            -- Convert x += y to x = x + y
            init = {AST.BinaryExpression(compoundOp, variables[1], init[1])}
        end
        
        return AST.AssignmentStatement(variables, init)
    end
    
    -- Otherwise it's a call statement
    if expr.type == AST.NodeType.CALL_EXPRESSION or
       expr.type == AST.NodeType.METHOD_CALL then
        return AST.CallStatement(expr)
    end
    
    self:error("Unexpected expression statement")
    return AST.CallStatement(expr)
end

-- ==================== EXPRESSION PARSING ====================

-- Parse expression with precedence climbing
function Parser:parseExpression(minPrec)
    minPrec = minPrec or 0
    local left = self:parseUnaryExpression()
    
    while true do
        local op = self:getCurrentOperator()
        local prec = Parser.Precedence[op]
        
        if not prec or prec < minPrec then
            break
        end
        
        self:advance() -- consume operator
        
        local nextMinPrec = prec
        if not Parser.RightAssoc[op] then
            nextMinPrec = prec + 1
        end
        
        local right = self:parseExpression(nextMinPrec)
        
        if op == "and" or op == "or" then
            left = AST.LogicalExpression(op, left, right)
        else
            left = AST.BinaryExpression(op, left, right)
        end
    end
    
    return left
end

-- Get current operator string
function Parser:getCurrentOperator()
    local token = self:peek()
    
    if token.type == Lexer.TokenType.KEYWORD then
        if token.value == "and" or token.value == "or" then
            return token.value
        end
    elseif token.type == Lexer.TokenType.PLUS then return "+"
    elseif token.type == Lexer.TokenType.MINUS then return "-"
    elseif token.type == Lexer.TokenType.STAR then return "*"
    elseif token.type == Lexer.TokenType.SLASH then return "/"
    elseif token.type == Lexer.TokenType.PERCENT then return "%"
    elseif token.type == Lexer.TokenType.CARET then return "^"
    elseif token.type == Lexer.TokenType.DOT_DOT then return ".."
    elseif token.type == Lexer.TokenType.EQUAL_EQUAL then return "=="
    elseif token.type == Lexer.TokenType.NOT_EQUAL then return "~="
    elseif token.type == Lexer.TokenType.LESS then return "<"
    elseif token.type == Lexer.TokenType.GREATER then return ">"
    elseif token.type == Lexer.TokenType.LESS_EQUAL then return "<="
    elseif token.type == Lexer.TokenType.GREATER_EQUAL then return ">="
    end
    
    return nil
end

-- Parse unary expression
function Parser:parseUnaryExpression()
    if self:check(Lexer.TokenType.KEYWORD, "not") then
        self:advance()
        return AST.UnaryExpression("not", self:parseUnaryExpression())
    elseif self:check(Lexer.TokenType.MINUS) then
        self:advance()
        return AST.UnaryExpression("-", self:parseUnaryExpression())
    elseif self:check(Lexer.TokenType.HASH) then
        self:advance()
        return AST.UnaryExpression("#", self:parseUnaryExpression())
    end
    
    return self:parsePowerExpression()
end

-- Parse power expression (right associative)
function Parser:parsePowerExpression()
    local base = self:parsePrefixExpression()
    
    if self:match(Lexer.TokenType.CARET) then
        local exp = self:parseUnaryExpression() -- right associative
        return AST.BinaryExpression("^", base, exp)
    end
    
    return base
end

-- Parse prefix expression (primary with suffix)
function Parser:parsePrefixExpression()
    local base = self:parsePrimaryExpression()
    return self:parseSuffixExpression(base)
end

-- Parse suffix (call, index, member)
function Parser:parseSuffixExpression(base)
    while true do
        if self:match(Lexer.TokenType.DOT) then
            local name = self:expect(Lexer.TokenType.IDENTIFIER, nil, "Expected identifier after '.'")
            base = AST.MemberExpression(base, AST.Identifier(name and name.value or "_error_"))
        
        elseif self:match(Lexer.TokenType.LEFT_BRACKET) then
            local index = self:parseExpression()
            self:expect(Lexer.TokenType.RIGHT_BRACKET, nil, "Expected ']'")
            base = AST.IndexExpression(base, index)
        
        elseif self:match(Lexer.TokenType.COLON) then
            local name = self:expect(Lexer.TokenType.IDENTIFIER, nil, "Expected method name after ':'")
            local args = self:parseCallArguments()
            base = AST.MethodCall(base, AST.Identifier(name and name.value or "_error_"), args)
        
        elseif self:check(Lexer.TokenType.LEFT_PAREN) or
               self:check(Lexer.TokenType.STRING) or
               self:check(Lexer.TokenType.LEFT_BRACE) then
            local args = self:parseCallArguments()
            base = AST.CallExpression(base, args)
        
        else
            break
        end
    end
    
    return base
end

-- Parse call arguments
function Parser:parseCallArguments()
    -- String argument
    if self:check(Lexer.TokenType.STRING) then
        return {AST.StringLiteral(self:advance().value)}
    end
    
    -- Table argument
    if self:check(Lexer.TokenType.LEFT_BRACE) then
        return {self:parseTableConstructor()}
    end
    
    -- Parenthesized arguments
    self:expect(Lexer.TokenType.LEFT_PAREN, nil, "Expected '(' for function call")
    
    local args = {}
    if not self:check(Lexer.TokenType.RIGHT_PAREN) then
        repeat
            table.insert(args, self:parseExpression())
        until not self:match(Lexer.TokenType.COMMA)
    end
    
    self:expect(Lexer.TokenType.RIGHT_PAREN, nil, "Expected ')' after arguments")
    
    return args
end

-- Parse primary expression
function Parser:parsePrimaryExpression()
    -- Number
    if self:check(Lexer.TokenType.NUMBER) then
        return AST.NumericLiteral(self:advance().value)
    end
    
    -- String
    if self:check(Lexer.TokenType.STRING) then
        return AST.StringLiteral(self:advance().value)
    end
    
    -- Boolean
    if self:check(Lexer.TokenType.BOOLEAN) then
        return AST.BooleanLiteral(self:advance().value)
    end
    
    -- Nil
    if self:check(Lexer.TokenType.NIL) then
        self:advance()
        return AST.NilLiteral()
    end
    
    -- Vararg
    if self:check(Lexer.TokenType.DOT_DOT_DOT) then
        self:advance()
        return AST.VarargLiteral()
    end
    
    -- Function expression
    if self:check(Lexer.TokenType.KEYWORD, "function") then
        return self:parseFunctionExpression()
    end
    
    -- Table constructor
    if self:check(Lexer.TokenType.LEFT_BRACE) then
        return self:parseTableConstructor()
    end
    
    -- Parenthesized expression
    if self:match(Lexer.TokenType.LEFT_PAREN) then
        local expr = self:parseExpression()
        self:expect(Lexer.TokenType.RIGHT_PAREN, nil, "Expected ')' after expression")
        return expr
    end
    
    -- Identifier
    if self:check(Lexer.TokenType.IDENTIFIER) then
        return AST.Identifier(self:advance().value)
    end
    
    self:error("Unexpected token in expression: " .. self:peek().type)
    return AST.NilLiteral()
end

-- Parse function expression
function Parser:parseFunctionExpression()
    self:advance() -- consume 'function'
    
    self:expect(Lexer.TokenType.LEFT_PAREN, nil, "Expected '(' after function")
    local params, isVararg = self:parseParameterList()
    self:expect(Lexer.TokenType.RIGHT_PAREN, nil, "Expected ')' after parameters")
    
    local body = self:parseBlock()
    self:expect(Lexer.TokenType.KEYWORD, "end", "Expected 'end' to close function")
    
    return AST.FunctionExpression(params, body, isVararg)
end

-- Parse table constructor
function Parser:parseTableConstructor()
    self:advance() -- consume '{'
    
    local fields = {}
    
    while not self:check(Lexer.TokenType.RIGHT_BRACE) and not self:isAtEnd() do
        local field
        
        -- [expr] = value
        if self:match(Lexer.TokenType.LEFT_BRACKET) then
            local key = self:parseExpression()
            self:expect(Lexer.TokenType.RIGHT_BRACKET, nil, "Expected ']' after table key")
            self:expect(Lexer.TokenType.EQUAL, nil, "Expected '=' after table key")
            local value = self:parseExpression()
            field = AST.TableKey(key, value)
        
        -- name = value or value
        elseif self:check(Lexer.TokenType.IDENTIFIER) then
            local name = self:advance()
            if self:match(Lexer.TokenType.EQUAL) then
                local value = self:parseExpression()
                field = AST.TableKeyString(name.value, value)
            else
                -- Just a value, backtrack
                self.current = self.current - 1
                field = AST.TableValue(self:parseExpression())
            end
        else
            field = AST.TableValue(self:parseExpression())
        end
        
        table.insert(fields, field)
        
        -- Field separator (, or ;)
        if not self:match(Lexer.TokenType.COMMA) and
           not self:match(Lexer.TokenType.SEMICOLON) then
            break
        end
    end
    
    self:expect(Lexer.TokenType.RIGHT_BRACE, nil, "Expected '}' to close table")
    
    return AST.TableConstructor(fields)
end

-- Parse label statement ::name::
function Parser:parseLabelStatement()
    self:advance() -- consume ::
    local name = self:expect(Lexer.TokenType.IDENTIFIER, nil, "Expected label name")
    self:expect(Lexer.TokenType.DOUBLE_COLON, nil, "Expected '::' after label name")
    return {type = "LabelStatement", name = name and name.value or "_error_"}
end

return Parser
