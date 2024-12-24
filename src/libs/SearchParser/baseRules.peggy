// This file includes basic grammar rules that are used in both search parsers.
// It is not a complete grammar.
// Its main purpose is to remove duplicated rules and ensure similar behaviour in parsers.
//
// operator: rule to match pre-defined search syntax operators, e.g. !=, >, etc.
// quotedString: rule to match a quoted string pattern, e.g. "this is a quoted string".
// alphanumeric: rule to match unquoted alphanumeric characters, e.g. a-z, 0-9, _, @, etc.
// logicalAnd: rule to match whitespace and return it as a logical 'and' operator.
// whitespace: rule to match whitespaces.

// rules to match re-defined search syntax keys.
date = "date"i { return "date"; }
amount = "amount"i { return "amount"; }
merchant = "merchant"i { return "merchant"; }
description = "description"i { return "description"; }
reportID = "reportid"i { return "reportID"; }
keyword = "keyword"i { return "keyword"; }
in = "in"i { return "in"; }
currency = "currency"i { return "currency"; }
tag = "tag"i { return "tag"; }
category = "category"i { return "category"; }
to = "to"i { return "to"; }
taxRate
  = "taxRate"i
  / "tax-rate"i { return "taxRate"; }
cardID
  = "cardID"
  / "card"i { return "cardID"; }
from = "from"i { return "from"; }
expenseType
  = "expenseType"
  / "expense-type"i { return "expenseType"; }
type = "type"i { return "type"; }
status = "status"i { return "status"; }
sortBy
  = "sortBy"
  / "sort-by"i { return "sortBy"; }
sortOrder
  = "sortOrder"
  / "sort-order"i { return "sortOrder"; }
policyID
  = "policyID"
  / "workspace"i { return "policyID"; }
submitted = "submitted"i { return "submitted"; }
approved = "approved"i { return "approved"; }
paid = "paid"i { return "paid"; }
exported = "exported"i { return "exported"; }
posted = "posted"i { return "posted"; }

operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

quotedString "quote"
  = start:[^ ,"\t\n\r]* "\"" inner:[^"\r\n]* "\"" end:[^ ,\t\n\r]* {
      return [...start, '"', ...inner, '"', ...end].join("");
    }

alphanumeric "word" = chars:[^ ,\t\n\r]+ { return chars.join("").trim(); }

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n]*
