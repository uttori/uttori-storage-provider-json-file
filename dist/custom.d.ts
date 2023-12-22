export type Operator = '=' | '!=' | '<=' | '<' | '>=' | '>' | 'LIKE' | 'IN' | 'NOT_IN' | 'INCLUDES' | 'EXCLUDES' | 'IS_NULL' | 'IS_NOT_NULL' | 'BETWEEN' | 'AND' | 'OR';
export type Value = string | number | Array<string | number | SqlWhereParserAst> | [string | number, string | number];

export type SqlWhereParserAst = {
  [key in Exclude<Operator, 'AND' | 'OR'>]?: Value;
} & {
  AND?: SqlWhereParserAst[];
  OR?: SqlWhereParserAst[];
};
