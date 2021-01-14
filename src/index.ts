import {readFileSync} from "fs";
import {parseProgram} from "./tokenizer";

const file = readFileSync("./test.lsp", 'utf-8');
const tree = parseProgram(file);
console.log("End");