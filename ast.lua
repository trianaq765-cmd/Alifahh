--[[
    Meson Obfuscator - AST Module
    Defines all AST node types for Lua
]]

local AST = {}

-- Node Types Enum
AST.NodeType = {
    -- Program
    PROGRAM = "Program",
    
    -- Statements
    LOCAL_STATEMENT = "LocalStatement",
    ASSIGNMENT_STATEMENT = "AssignmentStatement",
    FUNCTION_DECLARATION = "FunctionDeclaration",
    LOCAL_FUNCTION = "LocalFunction",
    IF_STATEMENT = "IfStatement",
    WHILE_STATEMENT = "WhileStatement",
    DO_STATEMENT = "DoStatement",
    FOR_NUMERIC = "ForNumericStatement",
    FOR_GENERIC = "ForGenericStatement",
    REPEAT_STATEMENT = "RepeatStatement",
    RETURN_STATEMENT = "ReturnStatement",
    BREAK_STATEMENT = "BreakStatement",
    CONTINUE_STATEMENT = "ContinueStatement",
    CALL_STATEMENT = "CallStatement",
    LABEL_STATEMENT = "LabelStatement",
    GOTO_STATEMENT = "GotoStatement",
    
    -- Expressions
    IDENTIFIER = "Identifier",
    NUMERIC_LITERAL = "NumericLiteral",
    STRING_LITERAL = "StringLiteral",
    BOOLEAN_LITERAL = "BooleanLiteral",
    NIL_LITERAL = "NilLiteral",
    VARARG_LITERAL = "VarargLiteral",
    
    BINARY_EXPRESSION = "BinaryExpression",
    UNARY_EXPRESSION = "UnaryExpression",
    LOGICAL_EXPRESSION = "LogicalExpression",
    
    CALL_EXPRESSION = "CallExpression",
    METHOD_CALL = "MethodCall",
    STRING_CALL = "StringCall",
    TABLE_CALL = "TableCall",
    
    MEMBER_EXPRESSION = "MemberExpression",
    INDEX_EXPRESSION = "IndexExpression",
    
    FUNCTION_EXPRESSION = "FunctionExpression",
    TABLE_CONSTRUCTOR = "TableConstructor",
    TABLE_KEY = "TableKey",
    TABLE_KEY_STRING = "TableKeyString",
    TABLE_VALUE = "TableValue",
    
    -- Special
    COMMENT = "Comment",
}

-- Create node constructors
function AST.Program(body)
    return {
        type = AST.NodeType.PROGRAM,
        body = body or {}
    }
end

-- Statements
function AST.LocalStatement(variables, init)
    return {
        type = AST.NodeType.LOCAL_STATEMENT,
        variables = variables,
        init = init or {}
    }
end

function AST.AssignmentStatement(variables, init)
    return {
        type = AST.NodeType.ASSIGNMENT_STATEMENT,
        variables = variables,
        init = init
    }
end

function AST.FunctionDeclaration(identifier, params, body, isLocal)
    return {
        type = isLocal and AST.NodeType.LOCAL_FUNCTION or AST.NodeType.FUNCTION_DECLARATION,
        identifier = identifier,
        parameters = params or {},
        body = body or {},
        isLocal = isLocal or false
    }
end

function AST.IfStatement(clauses, elseBody)
    return {
        type = AST.NodeType.IF_STATEMENT,
        clauses = clauses,  -- Array of {condition, body}
        elseBody = elseBody
    }
end

function AST.WhileStatement(condition, body)
    return {
        type = AST.NodeType.WHILE_STATEMENT,
        condition = condition,
        body = body or {}
    }
end

function AST.DoStatement(body)
    return {
        type = AST.NodeType.DO_STATEMENT,
        body = body or {}
    }
end

function AST.ForNumericStatement(variable, start, limit, step, body)
    return {
        type = AST.NodeType.FOR_NUMERIC,
        variable = variable,
        start = start,
        limit = limit,
        step = step,
        body = body or {}
    }
end

function AST.ForGenericStatement(variables, iterators, body)
    return {
        type = AST.NodeType.FOR_GENERIC,
        variables = variables,
        iterators = iterators,
        body = body or {}
    }
end

function AST.RepeatStatement(body, condition)
    return {
        type = AST.NodeType.REPEAT_STATEMENT,
        body = body or {},
        condition = condition
    }
end

function AST.ReturnStatement(arguments)
    return {
        type = AST.NodeType.RETURN_STATEMENT,
        arguments = arguments or {}
    }
end

function AST.BreakStatement()
    return {
        type = AST.NodeType.BREAK_STATEMENT
    }
end

function AST.ContinueStatement()
    return {
        type = AST.NodeType.CONTINUE_STATEMENT
    }
end

function AST.CallStatement(expression)
    return {
        type = AST.NodeType.CALL_STATEMENT,
        expression = expression
    }
end

-- Expressions
function AST.Identifier(name)
    return {
        type = AST.NodeType.IDENTIFIER,
        name = name
    }
end

function AST.NumericLiteral(value)
    return {
        type = AST.NodeType.NUMERIC_LITERAL,
        value = value
    }
end

function AST.StringLiteral(value)
    return {
        type = AST.NodeType.STRING_LITERAL,
        value = value
    }
end

function AST.BooleanLiteral(value)
    return {
        type = AST.NodeType.BOOLEAN_LITERAL,
        value = value
    }
end

function AST.NilLiteral()
    return {
        type = AST.NodeType.NIL_LITERAL,
        value = nil
    }
end

function AST.VarargLiteral()
    return {
        type = AST.NodeType.VARARG_LITERAL
    }
end

function AST.BinaryExpression(operator, left, right)
    return {
        type = AST.NodeType.BINARY_EXPRESSION,
        operator = operator,
        left = left,
        right = right
    }
end

function AST.UnaryExpression(operator, argument)
    return {
        type = AST.NodeType.UNARY_EXPRESSION,
        operator = operator,
        argument = argument
    }
end

function AST.LogicalExpression(operator, left, right)
    return {
        type = AST.NodeType.LOGICAL_EXPRESSION,
        operator = operator,
        left = left,
        right = right
    }
end

function AST.CallExpression(base, arguments)
    return {
        type = AST.NodeType.CALL_EXPRESSION,
        base = base,
        arguments = arguments or {}
    }
end

function AST.MethodCall(base, identifier, arguments)
    return {
        type = AST.NodeType.METHOD_CALL,
        base = base,
        identifier = identifier,
        arguments = arguments or {}
    }
end

function AST.MemberExpression(base, identifier)
    return {
        type = AST.NodeType.MEMBER_EXPRESSION,
        base = base,
        identifier = identifier
    }
end

function AST.IndexExpression(base, index)
    return {
        type = AST.NodeType.INDEX_EXPRESSION,
        base = base,
        index = index
    }
end

function AST.FunctionExpression(params, body, isVararg)
    return {
        type = AST.NodeType.FUNCTION_EXPRESSION,
        parameters = params or {},
        body = body or {},
        isVararg = isVararg or false
    }
end

function AST.TableConstructor(fields)
    return {
        type = AST.NodeType.TABLE_CONSTRUCTOR,
        fields = fields or {}
    }
end

function AST.TableKey(key, value)
    return {
        type = AST.NodeType.TABLE_KEY,
        key = key,
        value = value
    }
end

function AST.TableKeyString(key, value)
    return {
        type = AST.NodeType.TABLE_KEY_STRING,
        key = key,
        value = value
    }
end

function AST.TableValue(value)
    return {
        type = AST.NodeType.TABLE_VALUE,
        value = value
    }
end

return AST
