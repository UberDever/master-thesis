// Честно взято из протокола LSP 3.17
export type URI = string;
export type integer = number;
export type uinteger = number;

export interface Position {
    line: uinteger
    character: uinteger
}

export interface Range {
    start: Position
    end: Position
}

interface From {
    language: string | undefined
}

export interface SourceFile extends From {
    uri: URI
    range?: Range
}

export interface SourceCode extends From {
    code: string
}

// TODO: здесь должны учитываться многие возможные локации (см LocationLink[])
export type Source = SourceFile | SourceCode | undefined

export interface Identifier {
    name: string
    source: Source
}

// По порядку: неизвестные объявления, неизвестные области, неизвестные типы
export type VariableType = "delta" | "sigma" | "tau"

export interface Variable {
    index: uinteger
    type: VariableType
}

export interface Scope {
    index: uinteger
    source: Source
}

export type NameCollectionType = "declared" | "referenced" | "visible"

export interface NameCollection {
    scope: Variable | Scope
    names: NameCollectionType
}

export interface UsageConstraint {
    identifier: Identifier
    scope: Variable | Scope
    usage: "declaration" | "reference"
}

export interface ResolutionConstraint {
    reference: Identifier
    declaration: Variable
}

export interface UniquenessConstraint {
    names: NameCollection
}

export interface TypeDeclarationConstraint {
    declaration: Identifier | Variable
    type: Variable
}

// Непрозрачный, структура зависит от онтологии и системы типов
export type Type = Object

export interface TypeEqualConstraint {
    lhs: Variable
    rhs: Variable | Type
}

export interface DirectEdgeConstraint {
    from: Variable | Scope
    to: Variable | Scope
    label: string
}

export interface AssociationConstraint {
    declaration: Identifier | Variable
    scope: Variable | Scope
}

export interface NominalEdgeConstraint {
    scope: Variable | Scope
    reference: Identifier
    label: string
}

export interface SubsetConstraint {
    lhs: NameCollection
    rhs: NameCollection
}

export interface MustResolveConstraint {
    reference: Identifier
    scope: Variable | Scope
}

export interface EssentialConstraint {
    declaration: Identifier
    scope: Variable | Scope
}

export interface ExclusiveConstraint {
    declaration: Identifier
    scope: Variable | Scope
}

export interface IconicConstraint {
    declaration: Identifier
}

export type Constraint =
    UsageConstraint |
    ResolutionConstraint |
    UniquenessConstraint |
    TypeDeclarationConstraint |
    TypeEqualConstraint |
    DirectEdgeConstraint |
    AssociationConstraint |
    NominalEdgeConstraint |
    SubsetConstraint |
    MustResolveConstraint |
    EssentialConstraint |
    ExclusiveConstraint |
    IconicConstraint

// Для каждого *Response -- сценарий ошибки отдается согласно JSON RPC


export interface SubtranslationRequest {
    code: Source
    ontology: URI
}

export interface SubtranslationResponse {
    constraints: Constraint[]
    unrecognized: Source
}

// метод crossy/translate
export type TranslationRequest = SubtranslationRequest
export type TranslationResponse = SubtranslationResponse

// метод crossy/solve
export interface SolveRequest {
    constraints: Constraint[]
    ontology: URI
}

export type Substitution = {
    tag: "delta"
    data: Identifier
} | {
    tag: "sigma"
    data: Scope
} | {
    tag: "tau"
    data: Type
}

export interface SolveResponse {
    substitution: Map<Variable, Substitution>
}

// метод crossy/analyze
// объединение crossy/translate и crossy/solve с применением полученной подстановки
export interface AnalyzeRequest {
    code: Source
    ontology: URI
}

export interface AnalyzeResponse {
    constraints: Constraint[] // эти ограничения не должны содержать переменных
}

// метод crossy/configure
export interface ConfigureRequest {
    filesystem?: { workspace: URI }
    systemVariables?: boolean
    utilities?: boolean
}

export type FilesystemConfiguration = UsageConstraint | AssociationConstraint | DirectEdgeConstraint // рекурсивное дерево каталогов и файлов относительно проекта
export type SystemVariablesConfiguration = TypeDeclarationConstraint | TypeEqualConstraint // присваивание каждой системной переменной типа/статического значения
export type UtilitiesConfiguration = TypeDeclarationConstraint | TypeEqualConstraint // присваивание каждой утилите (библиотеке, приложению) типа/статического значения

export interface ConfigureResponse {
    configuration: (FilesystemConfiguration | SystemVariablesConfiguration | UtilitiesConfiguration)[]
    code: { language: string, source: Source }[]
}
