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
  let isColumnsContext = false;
}

// rules to match re-defined search syntax keys.
date = "date"i { return "date"; }
amount = "amount"i { return "amount"; }
merchant = "merchant"i { return "merchant"; }
description = "description"i { return "description"; }
reportID = "reportid"i / "report-id"i { return "reportID"; }
keyword = "keyword"i { return "keyword"; }
in = "in"i { return "in"; }
currency = "currency"i { return "currency"; }
groupCurrency
  = "groupCurrency"
  / "group-currency"i { return "groupCurrency"; }
tag = "tag"i { return "tag"; }
category = "category"i { return "category"; }
to = "to"i { return "to"; }
exporter = "exporter"i { return "exporter"; }
payer = "payer"i { return "payer"; }
taxRate
  = "taxRate"i
  / "tax-rate"i { return "taxRate"; }
cardID
  = "cardID"
  / "card"i { return "cardID"; }
from = "from"i { return "from"; }
attendee = "attendee"i {return "attendee"}
expenseType
  = "expenseType"
  / "expense-type"i { return "expenseType"; }
withdrawalType
  = "withdrawalType"
  / "withdrawal-type"i { return "withdrawalType"; }
withdrawalID
  = "withdrawalID"i
  / "withdrawal-id"i { return "withdrawalID"; }
billable = "billable"i { return "billable"; }
reimbursable = "reimbursable"i { return "reimbursable"; }
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
withdrawn = "withdrawn"i { return "withdrawn"; }
groupBy = "groupBy"i / "group-by"i { return "groupBy"; }
limit = "limit"i { return "limit"; }
feed = "feed"i { return "feed"; }
title = "title"i { return "title"; }
assignee = "assignee"i { return "assignee"; }
createdBy = "createdBy"i  / "created-by"i { return "createdBy"; }
action = "action"i { return "action"; }
total = "total"i {return "total"; }
has = "has"i {return "has"; }
is = "is"i {return "is"; }
purchaseAmount = "purchaseAmount"i / "purchase-amount"i {return "purchaseAmount"}
purchaseCurrency = "purchaseCurrency"i / "purchase-currency"i {return "purchaseCurrency"}
columns = "columns"i {
  isColumnsContext = true;
  return "columns";
}
view = "view"i {return "view"}

// Value transformation rules
values
  = &{ return isColumnsContext; } columnsValues
  / perDiem
  / draft

columnsValues
  = originalAmount
  / taxRateValue
  / taxAmount
  / policyName
  / withdrawalId
  / bankAccount
  / reportId
  / base62ReportId
  / exportedTo
  / exchangeRate
  / reimbursableTotal
  / nonReimbursableTotal
  / groupFrom
  / groupExpenses
  / groupTotal
  / groupCard
  / groupFeed
  / groupBankAccount
  / groupWithdrawn
  / groupWithdrawalId
  / groupCategory
  / groupTag
  / groupMerchant
  / groupMonth
  / groupWeek
  / groupYear
  / groupQuarter

perDiem                 = "per-diem"i &wordBoundary                 { return "perDiem"; }
draft                  = ("drafts"i / "draft"i) &wordBoundary       { return "drafts"; }
originalAmount          = "original-amount"i &wordBoundary          { return "originalamount"; }
taxAmount               = "tax"i &wordBoundary                      { return "taxAmount"; }
taxRateValue            = "tax-rate"i &wordBoundary                 { return "taxrate"; }
policyName              = "policy-name"i &wordBoundary              { return "policyname"; }
withdrawalId            = "withdrawal-id"i &wordBoundary            { return "withdrawalID"; }
bankAccount             = "bank-account"i &wordBoundary             { return "bankAccount"; }
reportId                = "long-report-id"i &wordBoundary           { return "reportID"; }
base62ReportId          = "report-id"i &wordBoundary                { return "base62ReportID"; }
exportedTo
  = "exportedTo"i
  / "exported-to"i { return "exportedTo"; }
exchangeRate            = "exchange-rate"i &wordBoundary            { return "exchangeRate"; }
reimbursableTotal       = "reimbursable-total"i &wordBoundary       { return "reimbursableTotal"; }
nonReimbursableTotal    = "non-reimbursable-total"i &wordBoundary   { return "nonReimbursableTotal"; }
groupFrom               = "group-from"i &wordBoundary               { return "groupFrom"; }
groupExpenses           = "group-expenses"i &wordBoundary           { return "groupExpenses"; }
groupTotal              = "group-total"i &wordBoundary              { return "groupTotal"; }
groupCard               = "group-card"i &wordBoundary               { return "groupCard"; }
groupFeed               = "group-feed"i &wordBoundary               { return "groupFeed"; }
groupBankAccount        = "group-bank-account"i &wordBoundary       { return "groupBankAccount"; }
groupWithdrawn          = "group-withdrawn"i &wordBoundary          { return "groupWithdrawn"; }
groupWithdrawalId       = "group-withdrawal-id"i &wordBoundary      { return "groupWithdrawalID"; }
groupCategory           = "group-category"i &wordBoundary          { return "groupCategory"; }
groupTag                = "group-tag"i &wordBoundary               { return "groupTag"; }
groupMerchant           = "group-merchant"i &wordBoundary          { return "groupMerchant"; }
groupMonth              = "group-month"i &wordBoundary              { return "groupMonth"; }
groupWeek               = "group-week"i &wordBoundary               { return "groupWeek"; }
groupYear               = "group-year"i &wordBoundary               { return "groupYear"; }
groupQuarter            = "group-quarter"i &wordBoundary            { return "groupQuarter"; }


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
      isColumnsContext = false;
      return o;
  }

alphanumeric "word" = chars:[^ ,\t\n\r\xA0]+ { return chars.join("").trim(); } //handle no-breaking space

logicalAnd = _ { 
  isColumnsContext = false;
  return "and";
}

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

wordBoundary
  = [ \t\n\r\xA0,:=<>!]  // whitespace, comma, or operator (so "exported-to:" is recognized)
  / !.              // or end of input
