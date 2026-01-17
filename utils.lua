--[[
    Meson Obfuscator - Utils Module
    Helper functions for the obfuscator
]]

local Utils = {}

-- Character checking functions
function Utils.isAlpha(c)
    return (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or c == '_'
end

function Utils.isDigit(c)
    return c >= '0' and c <= '9'
end

function Utils.isAlphaNumeric(c)
    return Utils.isAlpha(c) or Utils.isDigit(c)
end

function Utils.isHexDigit(c)
    return Utils.isDigit(c) or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F')
end

function Utils.isWhitespace(c)
    return c == ' ' or c == '\t' or c == '\r' or c == '\n'
end

-- String helpers
function Utils.charAt(str, index)
    if index < 1 or index > #str then return '' end
    return str:sub(index, index)
end

function Utils.substring(str, startIdx, endIdx)
    return str:sub(startIdx, endIdx or #str)
end

-- Deep copy table
function Utils.deepCopy(orig)
    local copy
    if type(orig) == 'table' then
        copy = {}
        for k, v in pairs(orig) do
            copy[Utils.deepCopy(k)] = Utils.deepCopy(v)
        end
        setmetatable(copy, Utils.deepCopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

-- Pretty print table (for debugging AST)
function Utils.prettyPrint(tbl, indent)
    indent = indent or 0
    local spacing = string.rep("  ", indent)
    
    if type(tbl) ~= "table" then
        return tostring(tbl)
    end
    
    local result = "{\n"
    for k, v in pairs(tbl) do
        local key = type(k) == "string" and k or "[" .. tostring(k) .. "]"
        if type(v) == "table" then
            result = result .. spacing .. "  " .. key .. " = " .. Utils.prettyPrint(v, indent + 1) .. ",\n"
        elseif type(v) == "string" then
            result = result .. spacing .. "  " .. key .. ' = "' .. v .. '",\n'
        else
            result = result .. spacing .. "  " .. key .. " = " .. tostring(v) .. ",\n"
        end
    end
    result = result .. spacing .. "}"
    return result
end

return Utils
