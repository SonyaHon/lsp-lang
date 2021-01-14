import {Program} from "./tokenizer";
import {writeFileSync} from "fs";

export interface CompileOptions {
    saveToFile?: string
}

// Compiles the program to javascript string
// Options.saveToFile - if presented auto saves builded file.
export function compile(program: Program, options: CompileOptions = {}): string {
    let result = '';

    if (options.saveToFile) {
        writeFileSync(options.saveToFile, result, 'utf8');
    }
    return result;
}