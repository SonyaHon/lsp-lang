export enum LiteralType {
    Boolean = "Boolean",
    String = "String",
    Number = "Number",
    Null = "Null",
    Atom = "Atom"
}

export interface Literal {
    type: LiteralType,
    value: string | boolean | number | null
}

export interface List {
    type: 'List',
    length: number,
    value: (List | Literal)[]
}

export interface Program {
    type: 'Program',
    source: string,
    value: List[]
}

export interface Result<T> {
    res: T,
    input: string
}

/*
    Tries to parse a character anf throws if its bad
 */
export function parseChar(char: string, input: string): Result<string> {
    if (input[0] !== char) throw new Error(`Syntax error. Char: ${char}, Input: ${input.substr(0, 10)}...`);
    return {
        res: char,
        input: input.substr(1),
    };
}

export function parseString(str: string, input: string): Result<string> {
    const arr = str.split('');
    for (let char of arr) {
        input = (parseChar(char, input)).input;
    }
    return {
        res: str,
        input
    };
}

export function parseTrue(input): Result<Literal> {
    input = parseString('true', input).input;
    return {
        res: {
            type: LiteralType.Boolean,
            value: true
        },
        input
    }
}

export function parseFalse(input): Result<Literal> {
    input = parseString('false', input).input;
    return {
        res: {
            type: LiteralType.Boolean,
            value: false,
        },
        input
    }
}

export function parseBoolean(input): Result<Literal> {
    try {
        return parseTrue(input);

    } catch (e) {
        return parseFalse(input);
    }
}

export function parseNull(input): Result<Literal> {
    input = parseString('null', input).input;
    return {
        res: {
            type: LiteralType.Null,
            value: null
        },
        input
    }
}

export function parseTill(tillChar: string, input: string): Result<string> {
    let i = 0;
    let value = '';
    while (input[i] !== tillChar && i < input.length) {
        value += input[i];
        i++;
    }

    if (input[i] !== tillChar) {
        throw new Error("Syntax error");
    }

    return {
        res: value,
        input: input.substr(i)
    }
}

export function parseTillRegex(regex: RegExp, input: string): Result<string> {
    let i = 0;
    let value = '';
    while (!regex.test(input[i]) && i < input.length) {
        value += input[i];
        i++;
    }

    if (!regex.test(input[i])) {
        throw new Error("Syntax error");
    }

    return {
        res: value,
        input: input.substr(i)
    }
}

export function parseCharRegex(regex: RegExp, input: string): Result<string> {
    let char = input[0];
    if (regex.test(char)) {
        return {
            res: input[0],
            input: input.substr(1)
        }
    }
    throw new Error('Syntax Error');
}

export function parseNumber(input: string): Result<Literal> {
    let first = parseCharRegex(/\d/, input);
    let other = parseTillRegex(/[^0-9.]/, first.input);
    const all = first.res + other.res;
    try {
        const value = Number(all);
        return {
            res: {
                type: LiteralType.Number,
                value
            },
            input: other.input
        }
    } catch (e) {
        throw new Error('Syntax error');
    }
}

export function parseStr(input: string): Result<Literal> {
    let backup = parseChar('"', input).input;
    const res = parseTill('"', backup);
    backup = parseChar('"', res.input).input;
    return {
        res: {
            type: LiteralType.String,
            value: res.res
        },
        input: backup
    }
}

export function parseAtom(input: string): Result<Literal> {
    let first = parseCharRegex(/[a-zA-Z]/, input);
    let other = parseTillRegex(/[^a-zA-Z0-9_]/, first.input);
    return {
        res: {
            type: LiteralType.Atom,
            value: first.res + other.res
        },
        input: other.input
    }
}

export function parseLiteral(input: string): Result<Literal> {
    const funcs = [
        parseNull,
        parseBoolean,
        parseStr,
        parseNumber,
        parseAtom
    ]

    for (let i = 0; i < funcs.length; i++) {
        try {
            return funcs[i](input)
        } catch (e) {
        }
    }
    throw new Error(`Syntax error. Input: ${input}`);
}

export function parseList(input: string): Result<List> {
    const open = parseChar('(', input);
    let length = 0;
    let value = [];
    let inp = open.input;
    while (true) {
        let val;
        try {
            val = parseLiteral(inp);
        } catch (e) {
            console.log("Could not parse any literal, parsing another list")
            try {
                val = parseList(inp);
            } catch (e) {
                console.log("Could not parse any list, parsing end of the list")
                break;
            }
        }
        value.push(val.res);
        length += 1;
        inp = val.input;
        try {
            inp = parseTillRegex(/\S/, inp).input;
        } catch (e) {
            break;
        }
    }
    inp = parseChar(')', inp).input;
    return {
        res: {
            type: "List",
            length,
            value
        },
        input: inp
    }
}

export function parseProgram(input: string): Program {
    let value = [];
    let inp = input;
    while (inp.length > 0) {
        try {
            const res = parseList(inp);
            value.push(res.res);
            inp = res.input;
        } catch (e) {
            inp = parseTillRegex(/\S/, inp).input;
        }
    }

    return {
        type: "Program",
        source: input,
        value
    }
}