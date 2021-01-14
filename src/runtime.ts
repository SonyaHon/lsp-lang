import {List, Program} from "./tokenizer";

export interface StackItem {
    callee: List,
    selfContext: Context,
    rootContext: Context,
}

export class Stack {
    private st: StackItem[] = [];

    initiate(values: List[], globalContext: Context): void {
        this.st = this.st.concat(values.map(callee => ({
            callee,
            selfContext: new Context(),
            rootContext: globalContext
        })));
    }

    isEmpty(): boolean {
        return false;
    }

    getNext(): StackItem {
        return this.st.shift();
    }
}

export class Heap {

}

export class Context {

}

export class LspRuntime {
    private stack: Stack;
    private heap: Heap;
    private globalContext: Context;

    constructor() {
        this.globalContext = new Context();
        this.heap = new Heap();
        this.stack = new Stack();
    }

    execute(program: Program) {
        if (program.type !== "Program") throw new Error("Not a valid program");
        this.stack.initiate(program.value, this.globalContext);
        while (!this.stack.isEmpty()) {
            const item = this.stack.getNext();
            this.call(item);
        }
    }

    call(item: StackItem): void {

    }
}