// This file includes basic grammar rules that are used in both search parsers.
// It is not a complete grammar.
// Its main purpose is to remove duplicated rules and ensure similar behaviour in parsers.
//
// operator: rule to match pre-defined search syntax operators, e.g. !=, >, etc.
// quotedString: rule to match a quoted string pattern, e.g. "this is a quoted string".
// alphanumeric: rule to match unquoted alphanumeric characters, e.g. a-z, 0-9, _, @, etc.
// logicalAnd: rule to match whitespace and return it as a logical 'and' operator.
// whitespace: rule to match whitespaces.

operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

quotedString "quote" = "\"" chars:[^"\r\n]* "\"" { return chars.join(""); }

alphanumeric "word"
  = chars:[^ "\t\n\r]+ {
      return chars.join("").trim().split(",").filter(Boolean);
    }

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n]*
