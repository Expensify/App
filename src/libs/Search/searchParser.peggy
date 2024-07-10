// src/libs/Search/searchParser.peggy
{
  const defaultValues = {
    "type": "expense",
    "status": "all",
    "sortBy": "date",
    "sortOrder": "desc",
    "offset": 0
  };

  function buildFilter(operator, left, right) {
    return { operator, left, right };
  }

  function applyDefaults(filters) {
    return {
      ...defaultValues,
      filters
    };
  }
}

query
  = _ filters:filterList { return applyDefaults(filters); }

filterList
  = head:filter tail:(filter logicalAnd)* {
      return tail.reduce((result, [right, op]) => buildFilter(op, result, right), head);
    }

filter
  = _ field:key? _ op:operator? _ value:identifier {
      if (!field && !op) {
        return buildFilter('eq', 'freeText', value.trim());
      } else {
        const values = value.split(',');
        return values.slice(1).reduce((acc, val) => buildFilter('or', acc, buildFilter('eq', field, val.trim())), buildFilter('eq', field, values[0]));
      }
    }

operator
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">" { return "gt"; }
  / ">=" { return "gte"; }
  / "<" { return "lt"; }
  / "<=" { return "lte"; }

key
  = "type" { return "type"; }
  / "status" { return "status"; }
  / "date" { return "date"; }
  / "amount" { return "amount"; }
  / "expenseType" { return "expenseType"; }
  / "in" { return "in"; }
  / "currency" { return "currency"; }
  / "merchant" { return "merchant"; }
  / "description" { return "description"; }
  / "from" { return "from"; }
  / "to" { return "to"; }
  / "category" { return "category"; }
  / "tag" { return "tag"; }
  / "taxRate" { return "taxRate"; }
  / "card" { return "card"; }
  / "reportID" { return "reportID"; }
  / "freeText" { return "freeText"; }
  / "sortBy" { return "sortBy"; }
  / "sortOrder" { return "sortOrder"; }
  / "offset" { return "offset"; }
  
identifier
 = parts:(quotedString / alphanumeric)+ { return parts.join(''); }
 
quotedString
  = '"' chars:[^"\r\n]* '"' { return chars.join(''); }

alphanumeric
  = chars:[A-Za-z0-9_@./#&+\-\\',]+ { return chars.join(''); }

logicalAnd
  = _ { return "and"; }

_ "whitespace"
  = [ \t\r\n]*

start
  = query