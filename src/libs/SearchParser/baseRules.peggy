// This file includes basic grammar rules that are used in both search parsers.
// It is not a complete grammar.
// Its main purpose is to remove duplicated rules and ensure similar behaviour in parsers.
//
// operator: rule to match pre-defined search syntax operators, e.g. !=, >, etc.
// quotedString: rule to match a quoted string pattern, e.g. "this is a quoted string".
// alphanumeric: rule to match unquoted alphanumeric characters, e.g. a-z, 0-9, _, @, etc.
// logicalAnd: rule to match whitespace and return it as a logical 'and' operator.
// whitespace: rule to match whitespaces.

// Per-parse initializer
{ 
  let nameOperator = false;
  let expectingNestedQuote = false;
}

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
groupBy = "groupBy"i / "group-by"i { return "groupBy"; }
feed = "feed"i { return "feed"; }

operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

filterOperator
  = o:operator {
      if (nameOperator) {
        expectingNestedQuote = (o === "eq"); // Use simple parser if no valid operator is found
      }
      return o;
  }

alphanumeric "word" = chars:[^ ,\t\n\r\xA0]+ { return chars.join("").trim(); } //handle no-breaking space

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n\xA0]* //handle no-breaking space

// Base quotedString rule (conditional, based on parser state)
quotedString
  = &{ return expectingNestedQuote; } nestedQuotedString
  / simpleQuotedString

simpleQuotedString "quote"
  = start:[^ ,"”“\t\n\r\xA0]* ("“" / "\"" / "”") inner:[^"”“\r\n]* ("“" / "\"" / "”") end:[^ ,\t\n\r\xA0]* { //handle no-breaking space
      return [...start, '"', ...inner, '"', ...end].join("");
    }

nestedQuotedString "quote"
  = start:[^ ,"”“\t\n\r\xA0]* ("“" / "\"" / "”")    // Opening quote
    inner:([^"”“\r\n]
    / (!closingQuote "“" {return "“"}) / (!closingQuote "”" {return "”"}) / (!closingQuote "\"" {return "\""} )
    )*                                              // Allow anything inside, but exclude true closing quotes
    end:closingQuote                                // Detect the actual closing quote
{
    return [...start, '"', ...inner, '"'].join("");
}

closingQuote
  = ("“" / "\"" / "”") &validClosingCondition       // A quote that is followed by a valid closing pattern

validClosingCondition
  = [ \t\n\r\xA0a-zA-Z0-9]* [a-zA-Z0-9]* [ \t\n\r\xA0]* operator  // Case 1: Followed by WORD + OPERATOR (new key-value pair)
  / [ \t\n\r\xA0a-zA-Z]* !operator !.  // Case 2: Followed by any number of spaces, or words, with no operator, and then an END OF INPUT.
  / [,] // Case 3: Followed by a comma
