/**
 * VM Compiler - Compiles Lua source to custom bytecode
 */

class VMCompiler {
    constructor(obfuscator) {
        this.obf = obfuscator;
        this.bytecode = [];
        this.constants = [];
        this.variables = new Map();
        this.functions = [];
        this.opcodes = {
            LOADK: 0x01,      // Load constant
            LOADNIL: 0x02,    // Load nil
            LOADBOOL: 0x03,   // Load boolean
            GETGLOBAL: 0x04,  // Get global
            SETGLOBAL: 0x05,  // Set global
            GETLOCAL: 0x06,   // Get local
            SETLOCAL: 0x07,   // Set local
            GETTABLE: 0x08,   // Get table index
            SETTABLE: 0x09,   // Set table index
            NEWTABLE: 0x0A,   // Create table
            ADD: 0x0B,        // Addition
            SUB: 0x0C,        // Subtraction
            MUL: 0x0D,        // Multiplication
            DIV: 0x0E,        // Division
            MOD: 0x0F,        // Modulo
            POW: 0x10,        // Power
            UNM: 0x11,        // Unary minus
            NOT: 0x12,        // Logical not
            LEN: 0x13,        // Length
            CONCAT: 0x14,     // Concatenation
            JMP: 0x15,        // Jump
            EQ: 0x16,         // Equal
            LT: 0x17,         // Less than
            LE: 0x18,         // Less or equal
            CALL: 0x19,       // Function call
            RETURN: 0x1A,     // Return
            FORLOOP: 0x1B,    // For loop
            FORPREP: 0x1C,    // For loop prep
            CLOSURE: 0x1D,    // Create closure
            VARARG: 0x1E,     // Vararg
            SELF: 0x1F,       // Self call
            GETUPVAL: 0x20,   // Get upvalue
            SETUPVAL: 0x21,   // Set upvalue
            TAILCALL: 0x22,   // Tail call
            TEST: 0x23,       // Test (for conditionals)
            MOVE: 0x24,       // Move register
        };
    }

    /**
     * Add constant and return index
     */
    addConstant(value) {
        const existing = this.constants.findIndex(c => c.value === value && c.type === typeof value);
        if (existing >= 0) return existing;
        
        this.constants.push({
            type: typeof value,
            value: value
        });
        return this.constants.length - 1;
    }

    /**
     * Emit instruction
     */
    emit(opcode, ...args) {
        this.bytecode.push({
            op: opcode,
            args: args,
            line: this.currentLine || 0
        });
        return this.bytecode.length - 1;
    }

    /**
     * Compile source code
     */
    compile(source) {
        this.bytecode = [];
        this.constants = [];
        this.variables = new Map();
        
        // Tokenize and parse (simplified)
        const tokens = this.tokenize(source);
        const ast = this.parse(tokens);
        
        // Compile AST to bytecode
        this.compileNode(ast);
        
        // Add return if not present
        if (this.bytecode.length === 0 || 
            this.bytecode[this.bytecode.length - 1].op !== this.opcodes.RETURN) {
            this.emit(this.opcodes.RETURN, 0, 0);
        }

        return {
            bytecode: this.bytecode,
            constants: this.constants,
            numLocals: this.variables.size,
            numUpvals: 0,
            source: source
        };
    }

    /**
     * Simple tokenizer
     */
    tokenize(source) {
        const tokens = [];
        let i = 0;
        const len = source.length;

        const keywords = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 
            'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 
            'return', 'then', 'true', 'until', 'while'];

        while (i < len) {
            // Skip whitespace
            while (i < len && /\s/.test(source[i])) i++;
            if (i >= len) break;

            const start = i;
            const char = source[i];

            // String
            if (char === '"' || char === "'") {
                const quote = char;
                i++;
                let str = '';
                while (i < len && source[i] !== quote) {
                    if (source[i] === '\\' && i + 1 < len) {
                        i++;
                        const esc = source[i];
                        if (esc === 'n') str += '\n';
                        else if (esc === 't') str += '\t';
                        else if (esc === 'r') str += '\r';
                        else str += esc;
                    } else {
                        str += source[i];
                    }
                    i++;
                }
                i++; // closing quote
                tokens.push({ type: 'STRING', value: str });
                continue;
            }

            // Number
            if (/\d/.test(char) || (char === '.' && /\d/.test(source[i + 1]))) {
                let num = '';
                if (source.substr(i, 2).toLowerCase() === '0x') {
                    num = source.substr(i, 2);
                    i += 2;
                    while (i < len && /[0-9a-fA-F]/.test(source[i])) {
                        num += source[i++];
                    }
                } else {
                    while (i < len && /[\d.]/.test(source[i])) {
                        num += source[i++];
                    }
                    if (source[i] === 'e' || source[i] === 'E') {
                        num += source[i++];
                        if (source[i] === '+' || source[i] === '-') num += source[i++];
                        while (i < len && /\d/.test(source[i])) num += source[i++];
                    }
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(num) });
                continue;
            }

            // Identifier/Keyword
            if (/[a-zA-Z_]/.test(char)) {
                let ident = '';
                while (i < len && /[a-zA-Z0-9_]/.test(source[i])) {
                    ident += source[i++];
                }
                if (keywords.includes(ident)) {
                    tokens.push({ type: 'KEYWORD', value: ident });
                } else if (ident === 'true' || ident === 'false') {
                    tokens.push({ type: 'BOOLEAN', value: ident === 'true' });
                } else if (ident === 'nil') {
                    tokens.push({ type: 'NIL', value: null });
                } else {
                    tokens.push({ type: 'IDENTIFIER', value: ident });
                }
                continue;
            }

            // Operators and punctuation
            const twoChar = source.substr(i, 2);
            const threeChar = source.substr(i, 3);
            
            if (threeChar === '...' || threeChar === '~==' ) {
                tokens.push({ type: 'OPERATOR', value: threeChar });
                i += 3;
                continue;
            }
            
            if (['==', '~=', '<=', '>=', '..', '::', '//', '<<', '>>', '+=', '-=', '*=', '/='].includes(twoChar)) {
                tokens.push({ type: 'OPERATOR', value: twoChar });
                i += 2;
                continue;
            }

            // Single char
            tokens.push({ type: 'OPERATOR', value: char });
            i++;
        }

        tokens.push({ type: 'EOF' });
        return tokens;
    }

    /**
     * Simple parser - creates basic AST
     */
    parse(tokens) {
        let pos = 0;

        const current = () => tokens[pos] || { type: 'EOF' };
        const advance = () => tokens[pos++];
        const check = (type, value) => {
            const t = current();
            return t.type === type && (value === undefined || t.value === value);
        };
        const match = (type, value) => {
            if (check(type, value)) {
                return advance();
            }
            return null;
        };

        const parseBlock = () => {
            const statements = [];
            while (!check('EOF') && !check('KEYWORD', 'end') && !check('KEYWORD', 'else') && 
                   !check('KEYWORD', 'elseif') && !check('KEYWORD', 'until')) {
                const stmt = parseStatement();
                if (stmt) statements.push(stmt);
            }
            return { type: 'Block', body: statements };
        };

        const parseStatement = () => {
            // Local declaration
            if (match('KEYWORD', 'local')) {
                if (match('KEYWORD', 'function')) {
                    const name = advance();
                    match('OPERATOR', '(');
                    const params = [];
                    while (!check('OPERATOR', ')') && !check('EOF')) {
                        const param = advance();
                        if (param.type === 'IDENTIFIER') params.push(param.value);
                        match('OPERATOR', ',');
                    }
                    match('OPERATOR', ')');
                    const body = parseBlock();
                    match('KEYWORD', 'end');
                    return { type: 'LocalFunction', name: name.value, params, body };
                } else {
                    const names = [];
                    do {
                        const name = advance();
                        if (name.type === 'IDENTIFIER') names.push(name.value);
                    } while (match('OPERATOR', ','));
                    
                    let init = [];
                    if (match('OPERATOR', '=')) {
                        do {
                            init.push(parseExpression());
                        } while (match('OPERATOR', ','));
                    }
                    return { type: 'LocalDeclaration', names, init };
                }
            }

            // Function declaration
            if (match('KEYWORD', 'function')) {
                let name = advance().value;
                while (match('OPERATOR', '.') || match('OPERATOR', ':')) {
                    name += '.' + advance().value;
                }
                match('OPERATOR', '(');
                const params = [];
                while (!check('OPERATOR', ')') && !check('EOF')) {
                    const param = advance();
                    if (param.type === 'IDENTIFIER' || param.value === '...') {
                        params.push(param.value);
                    }
                    match('OPERATOR', ',');
                }
                match('OPERATOR', ')');
                const body = parseBlock();
                match('KEYWORD', 'end');
                return { type: 'FunctionDeclaration', name, params, body };
            }

            // If statement
            if (match('KEYWORD', 'if')) {
                const condition = parseExpression();
                match('KEYWORD', 'then');
                const thenBody = parseBlock();
                let elseBody = null;
                
                while (match('KEYWORD', 'elseif')) {
                    // Handle elseif
                    parseExpression();
                    match('KEYWORD', 'then');
                    parseBlock();
                }
                
                if (match('KEYWORD', 'else')) {
                    elseBody = parseBlock();
                }
                match('KEYWORD', 'end');
                return { type: 'IfStatement', condition, then: thenBody, else: elseBody };
            }

            // While loop
            if (match('KEYWORD', 'while')) {
                const condition = parseExpression();
                match('KEYWORD', 'do');
                const body = parseBlock();
                match('KEYWORD', 'end');
                return { type: 'WhileStatement', condition, body };
            }

            // For loop
            if (match('KEYWORD', 'for')) {
                const var1 = advance();
                if (match('OPERATOR', '=')) {
                    const start = parseExpression();
                    match('OPERATOR', ',');
                    const limit = parseExpression();
                    let step = null;
                    if (match('OPERATOR', ',')) {
                        step = parseExpression();
                    }
                    match('KEYWORD', 'do');
                    const body = parseBlock();
                    match('KEYWORD', 'end');
                    return { type: 'NumericFor', var: var1.value, start, limit, step, body };
                } else {
                    // Generic for
                    const vars = [var1.value];
                    while (match('OPERATOR', ',')) {
                        vars.push(advance().value);
                    }
                    match('KEYWORD', 'in');
                    const iterators = [parseExpression()];
                    while (match('OPERATOR', ',')) {
                        iterators.push(parseExpression());
                    }
                    match('KEYWORD', 'do');
                    const body = parseBlock();
                    match('KEYWORD', 'end');
                    return { type: 'GenericFor', vars, iterators, body };
                }
            }

            // Repeat
            if (match('KEYWORD', 'repeat')) {
                const body = parseBlock();
                match('KEYWORD', 'until');
                const condition = parseExpression();
                return { type: 'RepeatStatement', body, condition };
            }

            // Do block
            if (match('KEYWORD', 'do')) {
                const body = parseBlock();
                match('KEYWORD', 'end');
                return { type: 'DoStatement', body };
            }

            // Return
            if (match('KEYWORD', 'return')) {
                const values = [];
                if (!check('KEYWORD', 'end') && !check('EOF') && !check('KEYWORD', 'else')) {
                    do {
                        values.push(parseExpression());
                    } while (match('OPERATOR', ','));
                }
                return { type: 'ReturnStatement', values };
            }

            // Break
            if (match('KEYWORD', 'break')) {
                return { type: 'BreakStatement' };
            }

            // Expression statement (assignment or call)
            const expr = parseExpression();
            if (expr) {
                if (match('OPERATOR', '=')) {
                    const values = [parseExpression()];
                    while (match('OPERATOR', ',')) {
                        values.push(parseExpression());
                    }
                    return { type: 'Assignment', targets: [expr], values };
                }
                return { type: 'ExpressionStatement', expression: expr };
            }

            // Skip unknown tokens
            if (!check('EOF')) advance();
            return null;
        };

        const parseExpression = () => {
            return parseOr();
        };

        const parseOr = () => {
            let left = parseAnd();
            while (match('KEYWORD', 'or')) {
                const right = parseAnd();
                left = { type: 'BinaryExpression', operator: 'or', left, right };
            }
            return left;
        };

        const parseAnd = () => {
            let left = parseComparison();
            while (match('KEYWORD', 'and')) {
                const right = parseComparison();
                left = { type: 'BinaryExpression', operator: 'and', left, right };
            }
            return left;
        };

        const parseComparison = () => {
            let left = parseConcat();
            const ops = ['==', '~=', '<', '>', '<=', '>='];
            while (ops.some(op => check('OPERATOR', op))) {
                const op = advance().value;
                const right = parseConcat();
                left = { type: 'BinaryExpression', operator: op, left, right };
            }
            return left;
        };

        const parseConcat = () => {
            let left = parseAddSub();
            while (match('OPERATOR', '..')) {
                const right = parseAddSub();
                left = { type: 'BinaryExpression', operator: '..', left, right };
            }
            return left;
        };

        const parseAddSub = () => {
            let left = parseMulDiv();
            while (check('OPERATOR', '+') || check('OPERATOR', '-')) {
                const op = advance().value;
                const right = parseMulDiv();
                left = { type: 'BinaryExpression', operator: op, left, right };
            }
            return left;
        };

        const parseMulDiv = () => {
            let left = parseUnary();
            while (check('OPERATOR', '*') || check('OPERATOR', '/') || check('OPERATOR', '%')) {
                const op = advance().value;
                const right = parseUnary();
                left = { type: 'BinaryExpression', operator: op, left, right };
            }
            return left;
        };

        const parseUnary = () => {
            if (match('KEYWORD', 'not')) {
                return { type: 'UnaryExpression', operator: 'not', argument: parseUnary() };
            }
            if (match('OPERATOR', '-')) {
                return { type: 'UnaryExpression', operator: '-', argument: parseUnary() };
            }
            if (match('OPERATOR', '#')) {
                return { type: 'UnaryExpression', operator: '#', argument: parseUnary() };
            }
            return parsePower();
        };

        const parsePower = () => {
            let left = parseCall();
            if (match('OPERATOR', '^')) {
                const right = parseUnary();
                left = { type: 'BinaryExpression', operator: '^', left, right };
            }
            return left;
        };

        const parseCall = () => {
            let expr = parsePrimary();
            
            while (true) {
                if (match('OPERATOR', '(')) {
                    const args = [];
                    while (!check('OPERATOR', ')') && !check('EOF')) {
                        args.push(parseExpression());
                        match('OPERATOR', ',');
                    }
                    match('OPERATOR', ')');
                    expr = { type: 'CallExpression', callee: expr, arguments: args };
                } else if (match('OPERATOR', ':')) {
                    const method = advance().value;
                    match('OPERATOR', '(');
                    const args = [];
                    while (!check('OPERATOR', ')') && !check('EOF')) {
                        args.push(parseExpression());
                        match('OPERATOR', ',');
                    }
                    match('OPERATOR', ')');
                    expr = { type: 'MethodCall', object: expr, method, arguments: args };
                } else if (match('OPERATOR', '.')) {
                    const prop = advance().value;
                    expr = { type: 'MemberExpression', object: expr, property: prop };
                } else if (match('OPERATOR', '[')) {
                    const index = parseExpression();
                    match('OPERATOR', ']');
                    expr = { type: 'IndexExpression', object: expr, index };
                } else if (check('STRING')) {
                    // String call: func"string"
                    const str = advance().value;
                    expr = { type: 'CallExpression', callee: expr, arguments: [{ type: 'StringLiteral', value: str }] };
                } else if (check('OPERATOR', '{')) {
                    // Table call: func{table}
                    const table = parseTableConstructor();
                    expr = { type: 'CallExpression', callee: expr, arguments: [table] };
                } else {
                    break;
                }
            }
            
            return expr;
        };

        const parsePrimary = () => {
            if (check('NUMBER')) {
                return { type: 'NumericLiteral', value: advance().value };
            }
            if (check('STRING')) {
                return { type: 'StringLiteral', value: advance().value };
            }
            if (check('BOOLEAN')) {
                return { type: 'BooleanLiteral', value: advance().value };
            }
            if (check('NIL')) {
                advance();
                return { type: 'NilLiteral' };
            }
            if (check('IDENTIFIER')) {
                return { type: 'Identifier', name: advance().value };
            }
            if (match('OPERATOR', '(')) {
                const expr = parseExpression();
                match('OPERATOR', ')');
                return expr;
            }
            if (check('OPERATOR', '{')) {
                return parseTableConstructor();
            }
            if (match('KEYWORD', 'function')) {
                match('OPERATOR', '(');
                const params = [];
                while (!check('OPERATOR', ')') && !check('EOF')) {
                    const param = advance();
                    if (param.type === 'IDENTIFIER' || param.value === '...') {
                        params.push(param.value);
                    }
                    match('OPERATOR', ',');
                }
                match('OPERATOR', ')');
                const body = parseBlock();
                match('KEYWORD', 'end');
                return { type: 'FunctionExpression', params, body };
            }
            if (match('OPERATOR', '...')) {
                return { type: 'Vararg' };
            }
            return null;
        };

        const parseTableConstructor = () => {
            match('OPERATOR', '{');
            const fields = [];
            while (!check('OPERATOR', '}') && !check('EOF')) {
                if (match('OPERATOR', '[')) {
                    const key = parseExpression();
                    match('OPERATOR', ']');
                    match('OPERATOR', '=');
                    const value = parseExpression();
                    fields.push({ type: 'ComputedField', key, value });
                } else if (check('IDENTIFIER') && tokens[pos + 1]?.value === '=') {
                    const key = advance().value;
                    match('OPERATOR', '=');
                    const value = parseExpression();
                    fields.push({ type: 'NamedField', key, value });
                } else {
                    const value = parseExpression();
                    if (value) fields.push({ type: 'ArrayField', value });
                }
                match('OPERATOR', ',') || match('OPERATOR', ';');
            }
            match('OPERATOR', '}');
            return { type: 'TableConstructor', fields };
        };

        return parseBlock();
    }

    /**
     * Compile AST node to bytecode
     */
    compileNode(node) {
        if (!node) return;

        switch (node.type) {
            case 'Block':
                for (const stmt of node.body) {
                    this.compileNode(stmt);
                }
                break;

            case 'LocalDeclaration':
                for (let i = 0; i < node.names.length; i++) {
                    const varIdx = this.variables.size;
                    this.variables.set(node.names[i], varIdx);
                    
                    if (node.init[i]) {
                        this.compileNode(node.init[i]);
                    } else {
                        this.emit(this.opcodes.LOADNIL, varIdx, 1);
                    }
                    this.emit(this.opcodes.SETLOCAL, varIdx);
                }
                break;

            case 'Assignment':
                for (let i = 0; i < node.values.length; i++) {
                    this.compileNode(node.values[i]);
                }
                for (let i = 0; i < node.targets.length; i++) {
                    const target = node.targets[i];
                    if (target.type === 'Identifier') {
                        if (this.variables.has(target.name)) {
                            this.emit(this.opcodes.SETLOCAL, this.variables.get(target.name));
                        } else {
                            const idx = this.addConstant(target.name);
                            this.emit(this.opcodes.SETGLOBAL, idx);
                        }
                    }
                }
                break;

            case 'NumericLiteral':
                const numIdx = this.addConstant(node.value);
                this.emit(this.opcodes.LOADK, numIdx);
                break;

            case 'StringLiteral':
                const strIdx = this.addConstant(node.value);
                this.emit(this.opcodes.LOADK, strIdx);
                break;

            case 'BooleanLiteral':
                this.emit(this.opcodes.LOADBOOL, node.value ? 1 : 0);
                break;

            case 'NilLiteral':
                this.emit(this.opcodes.LOADNIL, 0, 1);
                break;

            case 'Identifier':
                if (this.variables.has(node.name)) {
                    this.emit(this.opcodes.GETLOCAL, this.variables.get(node.name));
                } else {
                    const idx = this.addConstant(node.name);
                    this.emit(this.opcodes.GETGLOBAL, idx);
                }
                break;

            case 'BinaryExpression':
                this.compileNode(node.left);
                this.compileNode(node.right);
                switch (node.operator) {
                    case '+': this.emit(this.opcodes.ADD); break;
                    case '-': this.emit(this.opcodes.SUB); break;
                    case '*': this.emit(this.opcodes.MUL); break;
                    case '/': this.emit(this.opcodes.DIV); break;
                    case '%': this.emit(this.opcodes.MOD); break;
                    case '^': this.emit(this.opcodes.POW); break;
                    case '..': this.emit(this.opcodes.CONCAT); break;
                    case '==': this.emit(this.opcodes.EQ, 1); break;
                    case '~=': this.emit(this.opcodes.EQ, 0); break;
                    case '<': this.emit(this.opcodes.LT, 1); break;
                    case '>': this.emit(this.opcodes.LT, 0); break;
                    case '<=': this.emit(this.opcodes.LE, 1); break;
                    case '>=': this.emit(this.opcodes.LE, 0); break;
                }
                break;

            case 'UnaryExpression':
                this.compileNode(node.argument);
                switch (node.operator) {
                    case '-': this.emit(this.opcodes.UNM); break;
                    case 'not': this.emit(this.opcodes.NOT); break;
                    case '#': this.emit(this.opcodes.LEN); break;
                }
                break;

            case 'CallExpression':
                this.compileNode(node.callee);
                for (const arg of node.arguments) {
                    this.compileNode(arg);
                }
                this.emit(this.opcodes.CALL, node.arguments.length, 1);
                break;

            case 'MethodCall':
                this.compileNode(node.object);
                const methodIdx = this.addConstant(node.method);
                this.emit(this.opcodes.SELF, methodIdx);
                for (const arg of node.arguments) {
                    this.compileNode(arg);
                }
                this.emit(this.opcodes.CALL, node.arguments.length + 1, 1);
                break;

            case 'MemberExpression':
                this.compileNode(node.object);
                const propIdx = this.addConstant(node.property);
                this.emit(this.opcodes.GETTABLE, propIdx);
                break;

            case 'IndexExpression':
                this.compileNode(node.object);
                this.compileNode(node.index);
                this.emit(this.opcodes.GETTABLE);
                break;

            case 'TableConstructor':
                this.emit(this.opcodes.NEWTABLE, node.fields.length);
                let arrayIdx = 1;
                for (const field of node.fields) {
                    if (field.type === 'ArrayField') {
                        const idx = this.addConstant(arrayIdx++);
                        this.emit(this.opcodes.LOADK, idx);
                        this.compileNode(field.value);
                        this.emit(this.opcodes.SETTABLE);
                    } else if (field.type === 'NamedField') {
                        const idx = this.addConstant(field.key);
                        this.emit(this.opcodes.LOADK, idx);
                        this.compileNode(field.value);
                        this.emit(this.opcodes.SETTABLE);
                    } else if (field.type === 'ComputedField') {
                        this.compileNode(field.key);
                        this.compileNode(field.value);
                        this.emit(this.opcodes.SETTABLE);
                    }
                }
                break;

            case 'ReturnStatement':
                for (const val of node.values) {
                    this.compileNode(val);
                }
                this.emit(this.opcodes.RETURN, node.values.length);
                break;

            case 'IfStatement':
                this.compileNode(node.condition);
                const jumpFalse = this.emit(this.opcodes.JMP, 0); // Placeholder
                this.compileNode(node.then);
                
                if (node.else) {
                    const jumpEnd = this.emit(this.opcodes.JMP, 0);
                    this.bytecode[jumpFalse].args[0] = this.bytecode.length;
                    this.compileNode(node.else);
                    this.bytecode[jumpEnd].args[0] = this.bytecode.length;
                } else {
                    this.bytecode[jumpFalse].args[0] = this.bytecode.length;
                }
                break;

            case 'WhileStatement':
                const loopStart = this.bytecode.length;
                this.compileNode(node.condition);
                const exitJump = this.emit(this.opcodes.JMP, 0);
                this.compileNode(node.body);
                this.emit(this.opcodes.JMP, loopStart);
                this.bytecode[exitJump].args[0] = this.bytecode.length;
                break;

            case 'NumericFor':
                this.compileNode(node.start);
                this.compileNode(node.limit);
                if (node.step) {
                    this.compileNode(node.step);
                } else {
                    this.emit(this.opcodes.LOADK, this.addConstant(1));
                }
                const forStart = this.bytecode.length;
                this.emit(this.opcodes.FORPREP);
                const varIdx = this.variables.size;
                this.variables.set(node.var, varIdx);
                this.compileNode(node.body);
                this.emit(this.opcodes.FORLOOP, forStart);
                break;

            case 'FunctionDeclaration':
            case 'LocalFunction':
            case 'FunctionExpression':
                // Create closure
                const funcBytecode = new VMCompiler(this.obf);
                for (const param of node.params || []) {
                    funcBytecode.variables.set(param, funcBytecode.variables.size);
                }
                funcBytecode.compileNode(node.body);
                if (funcBytecode.bytecode.length === 0 || 
                    funcBytecode.bytecode[funcBytecode.bytecode.length - 1].op !== this.opcodes.RETURN) {
                    funcBytecode.emit(this.opcodes.RETURN, 0, 0);
                }
                
                const funcIdx = this.addConstant({
                    type: 'function',
                    bytecode: funcBytecode.bytecode,
                    constants: funcBytecode.constants,
                    numParams: (node.params || []).length,
                    numLocals: funcBytecode.variables.size
                });
                
                this.emit(this.opcodes.CLOSURE, funcIdx);
                
                if (node.type === 'LocalFunction' && node.name) {
                    const localIdx = this.variables.size;
                    this.variables.set(node.name, localIdx);
                    this.emit(this.opcodes.SETLOCAL, localIdx);
                } else if (node.type === 'FunctionDeclaration' && node.name) {
                    const nameIdx = this.addConstant(node.name);
                    this.emit(this.opcodes.SETGLOBAL, nameIdx);
                }
                break;

            case 'ExpressionStatement':
                this.compileNode(node.expression);
                break;

            case 'DoStatement':
                this.compileNode(node.body);
                break;

            default:
                // Unknown node type, skip
                break;
        }
    }
}

module.exports = VMCompiler;
