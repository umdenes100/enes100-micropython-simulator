
type AstNode = {
    type: string | null;
    sOffset: number;
    sLine: number;
    sColumn: number;
    eOffset: number;
    eLine: number;
    eColumn: number;
};

type BreakpointConditionPredicate = (prevNode: AstNode, newStmt: AstNode) => boolean;

export type CRuntime = {
    config: JSCPPConfig;
    numericTypeOrder: string[];
    types: { [typeSignature: string]: OpHandlerMap };
    intTypeLiteral: IntType;
    unsignedintTypeLiteral: IntType;
    longTypeLiteral: IntType;
    floatTypeLiteral: FloatType;
    doubleTypeLiteral: FloatType;
    charTypeLiteral: IntType;
    unsignedcharTypeLiteral: IntType;
    boolTypeLiteral: IntType;
    voidTypeLiteral: VoidType;
    nullPointerValue: PointerValue;
    voidPointerType: PointerType;
    nullPointer: PointerVariable;
    scope: RuntimeScope[];
    typedefs: { [name: string]: VariableType };
    interp: BaseInterpreter;

    include(name: string): void;
    getSize(element: Variable): number;
    getSizeByType(t: VariableType): number;
    getMember(l: Variable, r: string): Variable;
    defFunc(
        lt: VariableType,
        name: string,
        retType: VariableType,
        argTypes: VariableType[],
        argNames: string[],
        stmts: any,
        interp: Interpreter,
        optionalArgs: OptionalArg[]
    ): void;
    makeParametersSignature(args: (VariableType | "?" | "dummy")[]): string;
    getCompatibleFunc(
        lt: VariableType | "global",
        name: string,
        args: (Variable | DummyVariable)[]
    ): CFunction;
    getFunc(
        lt: VariableType | "global",
        name: string,
        args: (VariableType | "dummy")[]
    ): CFunction;
    makeOperatorFuncName(name: string): string;
    regOperator(
        f: CFunction,
        lt: VariableType,
        name: string,
        args: VariableType[],
        retType: VariableType
    ): void;
    regFunc(
        f: CFunction,
        lt: VariableType | "global",
        name: string,
        args: (VariableType | "?")[],
        retType: VariableType,
        optionalArgs?: OptionalArg[]
    ): void;
    regFuncPrototype(
        lt: VariableType | "global",
        name: string,
        args: VariableType[],
        retType: VariableType,
        optionalArgs?: OptionalArg[]
    ): void;
    registerTypedef(basttype: VariableType, name: string): void;
    promoteNumeric(l: VariableType, r: VariableType): VariableType;
    readVar(varname: string): Variable;
    varAlreadyDefined(varname: string): boolean;
    defVar(varname: string, type: VariableType, initval: Variable): void;
    booleanToNumber(b: BasicValue): number;
    inrange(type: VariableType, value: BasicValue, errorMsg?: string): boolean;
    ensureUnsigned(type: VariableType, value: BasicValue): BasicValue;
    isNumericType(type: VariableType | Variable | DummyVariable | string): boolean;
    isUnsignedType(type: VariableType | string): boolean;
    isIntegerType(type: Variable | VariableType | string): boolean;
    isFloatType(type: Variable | VariableType | string): boolean;
    getSignedType(type: VariableType): PrimitiveType;
    cast(type: VariableType, value: Variable | DummyVariable): Variable;
    clone(v: Variable, isInitializing?: boolean): Variable;
    enterScope(scopename: string): void;
    exitScope(scopename: string): void;
    val(t: VariableType, v: VariableValue, left?: boolean, isInitializing?: boolean): Variable;
    isTypeEqualTo(type1: VariableType | "?" | "dummy", type2: VariableType | "?" | "dummy"): boolean;
    isBoolType(type: VariableType | string): boolean;
    isVoidType(type: VariableType | string): boolean;
    isPrimitiveType(type: VariableType | Variable | DummyVariable | string): boolean;
    isArrayType(type: VariableType | Variable | DummyVariable): boolean;
    isArrayElementType(type: Variable | DummyVariable): boolean;
    isFunctionPointerType(type: VariableType | Variable | DummyVariable): boolean;
    isFunctionType(type: VariableType | Variable | DummyVariable): boolean;
    isNormalPointerType(type: VariableType | Variable | DummyVariable): boolean;
    isPointerType(type: VariableType | Variable | DummyVariable): boolean;
    isClassType(type: VariableType | Variable | DummyVariable): boolean;
    arrayPointerType(eleType: VariableType, size: number): ArrayType;
    makeArrayPointerValue(arr: Variable[], position: number): ArrayValue;
    functionPointerType(retType: VariableType, signature: (VariableType | "?")[]): FunctionPointerType;
    functionType(retType: VariableType, signature: (VariableType | "?")[]): FunctionType;
    makeFunctionPointerValue(
        f: FunctionVariable,
        name: string,
        lt: VariableType | "global",
        args: (VariableType | "?")[],
        retType: VariableType
    ): FunctionPointerValue;
    normalPointerType(targetType: VariableType): PointerType;
    makeNormalPointerValue(target: Variable): PointerValue;
    simpleType(type: string | string[]): VariableType;
    newClass(classname: string, members: Member[]): ClassType;
    primitiveType(type: CBasicType): PrimitiveType;
    isCharType(type: VariableType): boolean;
    isStringType(type: Variable | VariableType): boolean;
    getStringFromCharArray(element: ArrayVariable): string;
    makeCharArrayFromString(str: string, typename?: CBasicType): ArrayVariable;
    getTypeSignature(type: VariableType | "global" | "?" | "dummy"): string;
    makeTypeString(type: VariableType | "global" | "dummy" | "?"): string;
    makeValueString(l: Variable | DummyVariable, options?: MakeValueStringOptions): string;
    makeValString(l: Variable | DummyVariable): string;
    defaultValue(type: VariableType, left?: boolean): Variable;
    raiseException(message: string, currentNode?: any): void;
};


export type Debugger = {
    src: string;
    srcByLines: string[];
    prevNode: AstNode | null;
    done: boolean;
    conditions: {
        [condition: string]: BreakpointConditionPredicate;
    };
    stopConditions: {
        [condition: string]: boolean;
    };
    rt: CRuntime;
    gen: Generator<any, IntVariable | false, any>;

    setStopConditions(stopConditions: {
        [condition: string]: boolean;
    }): void;

    setCondition(name: string, callback: BreakpointConditionPredicate): void;

    disableCondition(name: string): void;

    enableCondition(name: string): void;

    getSource(): string;

    start(rt: CRuntime, gen: Generator<any, IntVariable | false, any>): Generator<any, IntVariable | false, any>;

    continue(): IntVariable | false | undefined;

    next(): IntVariable | false;

    nextLine(): string;

    nextNodeText(): string;

    nextNode(): AstNode;

    variable(name?: string): { type: string; value: any } | Array<{ name: string; type: string; value: string }>;
};

type IntVariable = any;

declare module "JSCPP" {
    export function run(code: string, input: string, config: JSCPPConfig): Debugger | undefined;
}