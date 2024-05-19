// Честно взято из протокола LSP 3.17
export type URI = string;
export type integer = number;
export type uinteger = number;

interface Position {
    line: uinteger
    character: uinteger
}

interface Range {
    start: Position
    end: Position
}

interface SourceFile {
    uri: URI
    range?: Range
}

interface SourceCode {
    code: string
}

type Source = SourceFile | SourceCode

interface Identifier {
    name: string
    source: Source
}

// По порядку: неизвестные объявления, неизвестные области, неизвестные типы
type VariableType = "delta" | "sigma" | "tau"

interface Variable {
    index: uinteger
    type: VariableType
}

interface Scope {
    index: uinteger
    type: "scope"
}

type NameCollectionType = "declared" | "referenced" | "visible"

interface NameCollection {
    scope: Variable | Scope
    names: NameCollectionType
}

interface UsageConstraint {
    identifier: Identifier
    scope: Variable | Scope
    usage: "declaration" | "reference"
}

interface ResolutionConstraint {
    reference: Identifier
    declaration: Variable
}

interface UniquenessConstraint {
    names: NameCollection
}

interface TypeDeclarationConstraint {
    declaration: Identifier | Variable
    type: Variable
}

// Непрозрачный, структура зависит от онтологии и системы типов
type Type = object

interface TypeEqualConstraint {
    lhs: Variable
    rhs: Variable | Type
}

interface DirectEdgeConstraint {
    from: Variable | Scope
    to: Variable | Scope
    label: string
}

interface AssociationConstraint {
    declaration: Identifier | Variable
    scope: Variable
}

interface NominalEdgeConstraint {
    scope: Variable | Scope
    reference: Identifier
    label: string
}

interface SubsetConstraint {
    lhs: NameCollection
    rhs: NameCollection
}

interface MustResolveConstraint {
    reference: Identifier
    scope: Variable | Scope
}

interface EssentialConstraint {
    declaration: Identifier
    scope: Variable | Scope
}

interface ExclusiveConstraint {
    declaration: Identifier
    scope: Variable | Scope
}

interface IconicConstraint {
    declaration: Identifier
}

type Constraint =
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


interface SubtranslationRequest {
    code: Source
    ontology: URI
}

interface SubtranslationResponse {
    constraints: Constraint[]
    unrecognized: Source
}

// метод crossy/translate
type TranslationRequest = SubtranslationRequest
type TranslationResponse = SubtranslationResponse

// метод crossy/solve
interface SolveRequest {
    constraints: Constraint[]
    ontology: URI
}

type Substitution = {
    tag: "delta"
    data: Identifier
} | {
    tag: "sigma"
    data: Scope
} | {
    tag: "tau"
    data: Type
}

interface SolveResponse {
    substitution: Map<Variable, Substitution>
}

// метод crossy/analyze
// объединение crossy/translate и crossy/solve с применением полученной подстановки
interface AnalyzeRequest {
    code: Source
    ontology: URI
}

interface AnalyzeResponse {
    constraints: Constraint[] // эти ограничения не должны содержать переменных
}

// метод crossy/configure
interface ConfigureRequest {
    filesystem?: { workspace: URI }
    systemVariables?: boolean
    utilities?: boolean
}

type FilesystemConfiguration = UsageConstraint | AssociationConstraint | DirectEdgeConstraint // рекурсивное дерево каталогов и файлов относительно проекта
type SystemVariablesConfiguration = TypeDeclarationConstraint | TypeEqualConstraint // присваивание каждой системной переменной типа/статического значения
type UtilitiesConfiguration = TypeDeclarationConstraint | TypeEqualConstraint // присваивание каждой утилите (библиотеке, приложению) типа/статического значения

interface ConfigureResponse {
    configuration: (FilesystemConfiguration | SystemVariablesConfiguration | UtilitiesConfiguration)[]
    code: {language: string, source: Source}[]
}