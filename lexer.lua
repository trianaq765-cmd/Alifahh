--[[
    Meson Obfuscator - Lexer Module
    Converts Lua source code into tokens
    
    Supports:
    - Lua 5.1 syntax
    - Roblox Lua extensions (continue, +=, etc.)
    - All string types (single, double, long strings)
    - All number formats (decimal, hex, scientific)
]]

local Utils = loadstring(game:HttpGet("YOUR_UTILS_URL"))() -- atau require

local Lexer = {}
Lexer.__index = Lexer

-- Token Types
Lexer.TokenType = {
    -- Literals
    NUMBER = "NUMBER",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    NIL = "NIL",
    VARARG = "VARARG",
    
    -- Identifiers & Keywords
    IDENTIFIER = "IDENTIFIER",
    KEYWORD = "KEYWORD",
    
    -- Operators
    PLUS = "PLUS",               -- +
    MINUS = "MINUS",             -- -
    STAR = "STAR",               -- *
    SLASH = "SLASH",             -- /
    PERCENT = "PERCENT",         -- %
    CARET = "CARET",             -- ^
    HASH = "HASH",               -- #
    
    -- Comparison
    EQUAL_EQUAL = "EQUAL_EQUAL", -- ==
    NOT_EQUAL = "NOT_EQUAL",     -- ~=
    LESS = "LESS",               -- <
    GREATER = "GREATER",         -- >
    LESS_EQUAL = "LESS_EQUAL",   -- <=
    GREATER_EQUAL = "GREATER_EQUAL", -- >=
    
    -- Assignment
    EQUAL = "EQUAL",             -- =
    PLUS_EQUAL = "PLUS_EQUAL",   -- += (Roblox)
    MINUS_EQUAL = "MINUS_EQUAL", -- -= (Roblox)
    STAR_EQUAL = "STAR_EQUAL",   -- *= (Roblox)
    SLASH_EQUAL = "SLASH_EQUAL", -- /= (Roblox)
    
    -- Delimiters
    LEFT_PAREN = "LEFT_PAREN",   -- (
    RIGHT_PAREN = "RIGHT_PAREN", -- )
    LEFT_BRACE = "LEFT_BRACE",   -- {
    RIGHT_BRACE = "RIGHT_BRACE", -- }
    LEFT_BRACKET = "LEFT_BRACKET",   -- [
    RIGHT_BRACKET = "RIGHT_BRACKET", -- ]
    
    -- Punctuation
    SEMICOLON = "SEMICOLON",     -- ;
    COLON = "COLON",             -- :
    DOUBLE_COLON = "DOUBLE_COLON", -- :: (labels)
    COMMA = "COMMA",             -- ,
    DOT = "DOT",                 -- .
    DOT_DOT = "DOT_DOT",         -- ..
    DOT_DOT_DOT = "DOT_DOT_DOT", -- ...
    
    -- Special
    EOF = "EOF",
    NEWLINE = "NEWLINE",
}

-- Lua Keywords
Lexer.Keywords = {
    ["and"] = true,
    ["break"] = true,
    ["do"] = true,
    ["else"] = true,
    ["elseif"] = true,
    ["end"] = true,
    ["false"] = true,
    ["for"] = true,
    ["function"] = true,
    ["if"] = true,
    ["in"] = true,
    ["local"] = true,
    ["nil"] = true,
    ["not"] = true,
    ["or"] = true,
    ["repeat"] = true,
    ["return"] = true,
    ["then"] = true,
    ["true"] = true,
    ["until"] = true,
    ["while"] = true,
    -- Roblox additions
    ["continue"] = true,
    ["type"] = true,
    ["export"] = true,
}

-- Create new Lexer instance
function Lexer.new(source)
    local self = setmetatable({}, Lexer)
    self.source = source
    self.tokens = {}
    self.start = 1
    self.current = 1
    self.line = 1
    self.column = 1
    self.errors = {}
    return self
end

-- Check if at end of source
function Lexer:isAtEnd()
    return self.current > #self.source
end

-- Get current character
function Lexer:peek()
    if self:isAtEnd() then return '\0' end
    return Utils.charAt(self.source, self.current)
end

-- Get next character
function Lexer:peekNext()
    if self.current + 1 > #self.source then return '\0' end
    return Utils.charAt(self.source, self.current + 1)
end

-- Look ahead n characters
function Lexer:peekAhead(n)
    local pos = self.current + n
    if pos > #self.source then return '\0' end
    return Utils.charAt(self.source, pos)
end

-- Advance and return current character
function Lexer:advance()
    local c = self:peek()
    self.current = self.current + 1
    if c == '\n' then
        self.line = self.line + 1
        self.column = 1
    else
        self.column = self.column + 1
    end
    return c
end

-- Check if current character matches expected
function Lexer:match(expected)
    if self:isAtEnd() then return false end
    if self:peek() ~= expected then return false end
    self:advance()
    return true
end

-- Add token to list
function Lexer:addToken(tokenType, value)
    local lexeme = Utils.substring(self.source, self.start, self.current - 1)
    table.insert(self.tokens, {
        type = tokenType,
        lexeme = lexeme,
        value = value or lexeme,
        line = self.line,
        column = self.column - #lexeme,
        start = self.start,
        ["end"] = self.current - 1
    })
end

-- Report error
function Lexer:error(message)
    table.insert(self.errors, {
        message = message,
        line = self.line,
        column = self.column
    })
end

-- Skip whitespace and comments
function Lexer:skipWhitespaceAndComments()
    while not self:isAtEnd() do
        local c = self:peek()
        
        if c == ' ' or c == '\t' or c == '\r' then
            self:advance()
        elseif c == '\n' then
            self:advance()
        elseif c == '-' and self:peekNext() == '-' then
            self:skipComment()
        else
            break
        end
    end
end

-- Skip comment
function Lexer:skipComment()
    -- Skip --
    self:advance()
    self:advance()
    
    -- Check for long comment --[[ ]]
    if self:peek() == '[' then
        local eqCount = 0
        local pos = self.current + 1
        
        while Utils.charAt(self.source, pos) == '=' do
            eqCount = eqCount + 1
            pos = pos + 1
        end
        
        if Utils.charAt(self.source, pos) == '[' then
            -- Long comment
            self:advance() -- skip first [
            for i = 1, eqCount do self:advance() end -- skip =
            self:advance() -- skip second [
            
            -- Find closing ]=*]
            while not self:isAtEnd() do
                if self:peek() == ']' then
                    local matched = true
                    local checkPos = self.current + 1
                    
                    for i = 1, eqCount do
                        if Utils.charAt(self.source, checkPos) ~= '=' then
                            matched = false
                            break
                        end
                        checkPos = checkPos + 1
                    end
                    
                    if matched and Utils.charAt(self.source, checkPos) == ']' then
                        self:advance() -- skip ]
                        for i = 1, eqCount do self:advance() end -- skip =
                        self:advance() -- skip ]
                        return
                    end
                end
                self:advance()
            end
            return
        end
    end
    
    -- Single line comment
    while self:peek() ~= '\n' and not self:isAtEnd() do
        self:advance()
    end
end

-- Scan string literal
function Lexer:scanString(quote)
    local value = ""
    
    while self:peek() ~= quote and not self:isAtEnd() do
        local c = self:peek()
        
        if c == '\n' then
            self:error("Unterminated string")
            return
        end
        
        if c == '\\' then
            self:advance()
            local escaped = self:peek()
            
            if escaped == 'n' then value = value .. '\n'
            elseif escaped == 't' then value = value .. '\t'
            elseif escaped == 'r' then value = value .. '\r'
            elseif escaped == '\\' then value = value .. '\\'
            elseif escaped == '"' then value = value .. '"'
            elseif escaped == "'" then value = value .. "'"
            elseif escaped == '0' then value = value .. '\0'
            elseif escaped == 'x' then
                -- Hex escape \xXX
                self:advance()
                local hex = ""
                for i = 1, 2 do
                    if Utils.isHexDigit(self:peek()) then
                        hex = hex .. self:advance()
                    end
                end
                if #hex == 2 then
                    value = value .. string.char(tonumber(hex, 16))
                end
                -- Don't advance again, continue will do it
                goto continue
            elseif Utils.isDigit(escaped) then
                -- Decimal escape \ddd
                local num = ""
                for i = 1, 3 do
                    if Utils.isDigit(self:peek()) then
                        num = num .. self:advance()
                    else
                        break
                    end
                end
                value = value .. string.char(tonumber(num))
                goto continue
            else
                value = value .. escaped
            end
            self:advance()
        else
            value = value .. c
            self:advance()
        end
        ::continue::
    end
    
    if self:isAtEnd() then
        self:error("Unterminated string")
        return
    end
    
    self:advance() -- closing quote
    self:addToken(Lexer.TokenType.STRING, value)
end

-- Scan long string [[ ]] or [=[ ]=]
function Lexer:scanLongString()
    local eqCount = 0
    
    self:advance() -- skip first [
    
    while self:peek() == '=' do
        eqCount = eqCount + 1
        self:advance()
    end
    
    if self:peek() ~= '[' then
        self:error("Invalid long string delimiter")
        return
    end
    
    self:advance() -- skip second [
    
    -- Skip first newline if present
    if self:peek() == '\n' then
        self:advance()
    end
    
    local value = ""
    
    while not self:isAtEnd() do
        if self:peek() == ']' then
            local matched = true
            local checkPos = self.current + 1
            
            for i = 1, eqCount do
                if Utils.charAt(self.source, checkPos) ~= '=' then
                    matched = false
                    break
                end
                checkPos = checkPos + 1
            end
            
            if matched and Utils.charAt(self.source, checkPos) == ']' then
                -- Found closing
                self:advance() -- skip ]
                for i = 1, eqCount do self:advance() end
                self:advance() -- skip ]
                self:addToken(Lexer.TokenType.STRING, value)
                return
            end
        end
        
        value = value .. self:advance()
    end
    
    self:error("Unterminated long string")
end

-- Scan number literal
function Lexer:scanNumber()
    local isHex = false
    
    -- Check for hex
    if self:peek() == '0' and (self:peekNext() == 'x' or self:peekNext() == 'X') then
        isHex = true
        self:advance() -- 0
        self:advance() -- x
        
        while Utils.isHexDigit(self:peek()) do
            self:advance()
        end
    else
        -- Decimal
        while Utils.isDigit(self:peek()) do
            self:advance()
        end
        
        -- Decimal point
        if self:peek() == '.' and Utils.isDigit(self:peekNext()) then
            self:advance()
            while Utils.isDigit(self:peek()) do
                self:advance()
            end
        end
        
        -- Exponent
        if self:peek() == 'e' or self:peek() == 'E' then
            self:advance()
            if self:peek() == '+' or self:peek() == '-' then
                self:advance()
            end
            while Utils.isDigit(self:peek()) do
                self:advance()
            end
        end
    end
    
    local lexeme = Utils.substring(self.source, self.start, self.current - 1)
    local value = tonumber(lexeme)
    self:addToken(Lexer.TokenType.NUMBER, value)
end

-- Scan identifier or keyword
function Lexer:scanIdentifier()
    while Utils.isAlphaNumeric(self:peek()) do
        self:advance()
    end
    
    local lexeme = Utils.substring(self.source, self.start, self.current - 1)
    
    -- Check for keywords
    if lexeme == "true" then
        self:addToken(Lexer.TokenType.BOOLEAN, true)
    elseif lexeme == "false" then
        self:addToken(Lexer.TokenType.BOOLEAN, false)
    elseif lexeme == "nil" then
        self:addToken(Lexer.TokenType.NIL, nil)
    elseif Lexer.Keywords[lexeme] then
        self:addToken(Lexer.TokenType.KEYWORD, lexeme)
    else
        self:addToken(Lexer.TokenType.IDENTIFIER, lexeme)
    end
end

-- Scan single token
function Lexer:scanToken()
    self:skipWhitespaceAndComments()
    
    if self:isAtEnd() then
        return false
    end
    
    self.start = self.current
    local c = self:advance()
    
    -- Single character tokens
    if c == '(' then self:addToken(Lexer.TokenType.LEFT_PAREN)
    elseif c == ')' then self:addToken(Lexer.TokenType.RIGHT_PAREN)
    elseif c == '{' then self:addToken(Lexer.TokenType.LEFT_BRACE)
    elseif c == '}' then self:addToken(Lexer.TokenType.RIGHT_BRACE)
    elseif c == ']' then self:addToken(Lexer.TokenType.RIGHT_BRACKET)
    elseif c == ';' then self:addToken(Lexer.TokenType.SEMICOLON)
    elseif c == ',' then self:addToken(Lexer.TokenType.COMMA)
    elseif c == '#' then self:addToken(Lexer.TokenType.HASH)
    elseif c == '^' then self:addToken(Lexer.TokenType.CARET)
    elseif c == '%' then self:addToken(Lexer.TokenType.PERCENT)
    
    -- Two character tokens
    elseif c == '+' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.PLUS_EQUAL)
        else
            self:addToken(Lexer.TokenType.PLUS)
        end
    elseif c == '-' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.MINUS_EQUAL)
        else
            self:addToken(Lexer.TokenType.MINUS)
        end
    elseif c == '*' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.STAR_EQUAL)
        else
            self:addToken(Lexer.TokenType.STAR)
        end
    elseif c == '/' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.SLASH_EQUAL)
        else
            self:addToken(Lexer.TokenType.SLASH)
        end
    elseif c == '=' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.EQUAL_EQUAL)
        else
            self:addToken(Lexer.TokenType.EQUAL)
        end
    elseif c == '~' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.NOT_EQUAL)
        else
            self:error("Unexpected character: ~")
        end
    elseif c == '<' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.LESS_EQUAL)
        else
            self:addToken(Lexer.TokenType.LESS)
        end
    elseif c == '>' then
        if self:match('=') then
            self:addToken(Lexer.TokenType.GREATER_EQUAL)
        else
            self:addToken(Lexer.TokenType.GREATER)
        end
    elseif c == ':' then
        if self:match(':') then
            self:addToken(Lexer.TokenType.DOUBLE_COLON)
        else
            self:addToken(Lexer.TokenType.COLON)
        end
    
    -- Dots
    elseif c == '.' then
        if self:match('.') then
            if self:match('.') then
                self:addToken(Lexer.TokenType.DOT_DOT_DOT)
            else
                self:addToken(Lexer.TokenType.DOT_DOT)
            end
        elseif Utils.isDigit(self:peek()) then
            -- Number starting with .
            while Utils.isDigit(self:peek()) do
                self:advance()
            end
            if self:peek() == 'e' or self:peek() == 'E' then
                self:advance()
                if self:peek() == '+' or self:peek() == '-' then
                    self:advance()
                end
                while Utils.isDigit(self:peek()) do
                    self:advance()
                end
            end
            local lexeme = Utils.substring(self.source, self.start, self.current - 1)
            self:addToken(Lexer.TokenType.NUMBER, tonumber(lexeme))
        else
            self:addToken(Lexer.TokenType.DOT)
        end
    
    -- Brackets (check for long string)
    elseif c == '[' then
        if self:peek() == '[' or self:peek() == '=' then
            self.current = self.current - 1 -- go back
            self:scanLongString()
        else
            self:addToken(Lexer.TokenType.LEFT_BRACKET)
        end
    
    -- Strings
    elseif c == '"' then
        self:scanString('"')
    elseif c == "'" then
        self:scanString("'")
    
    -- Numbers
    elseif Utils.isDigit(c) then
        self.current = self.current - 1 -- go back
        self:scanNumber()
    
    -- Identifiers
    elseif Utils.isAlpha(c) then
        self.current = self.current - 1 -- go back
        self:scanIdentifier()
    
    else
        self:error("Unexpected character: " .. c)
    end
    
    return true
end

-- Main tokenize function
function Lexer:tokenize()
    while self:scanToken() do end
    
    -- Add EOF token
    self.start = self.current
    self:addToken(Lexer.TokenType.EOF)
    
    return self.tokens, self.errors
end

-- Utility: Print all tokens (for debugging)
function Lexer:printTokens()
    print("\n" .. string.rep("=", 60))
    print("TOKENS:")
    print(string.rep("=", 60))
    
    for i, token in ipairs(self.tokens) do
        local valueStr = ""
        if token.value ~= token.lexeme then
            if type(token.value) == "string" then
                valueStr = string.format(' value="%s"', token.value:gsub("\n", "\\n"))
            else
                valueStr = string.format(" value=%s", tostring(token.value))
            end
        end
        print(string.format("[%3d] %-15s %-20s Line:%-3d Col:%-3d%s",
            i,
            token.type,
            '"' .. token.lexeme:sub(1, 15):gsub("\n", "\\n") .. '"',
            token.line,
            token.column,
            valueStr
        ))
    end
    print(string.rep("=", 60))
end

return Lexer
