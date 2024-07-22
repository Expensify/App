// This files defines the grammar that's used by [Peggy](https://peggyjs.org/) to generate the searchParser.js file.
// The searchParser is setup to parse our custom search syntax and output an AST with the filters.
//
// Here's a general grammar structure:
//
// start: entry point for the parser. It calls the query rule and return its value.
// query: rule to process the values returned by the filterList rule. Takes filters as an argument and returns the final AST output.
// filterList: rule to process the array of filters returned by the filter rule. It takes head and tail as arguments, filters it for null values and builds the AST.
// filter: rule to build the filter object. It takes field, operator and value as input and returns {operator, left: field, right: value} or null if the left value is a defaultValues
// operator: rule to match pre-defined search syntax operators, e.g. !=, >, etc
// key: rule to match pre-defined search syntax fields, e.g. amount, merchant, etc
// identifier: composite rule to match patterns defined by the quotedString and alphanumeric rules
// quotedString: rule to match a quoted string pattern, e.g. "this is a quoted string"
// alphanumeric: rule to match unquoted alphanumeric characters, e.g. a-z, 0-9, _, @, etc
// logicalAnd: rule to match whitespace and return it as a logical 'and' operator
// whitespace: rule to match whitespaces

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
  
  function updateDefaultValues(field, value) {
    defaultValues[field] = value;
  }

  function isDefaultField(field) {
    return defaultValues.hasOwnProperty(field);
  }
}

query
  = _ filters:filterList? _ { return applyDefaults(filters); }

filterList
  = head:filter tail:(logicalAnd filter)* {
      const allFilters = [head, ...tail.map(([_, filter]) => filter)].filter(filter => filter !== null);
      if (!allFilters.length) {
      	return null;
      }
      return allFilters.reduce((result, filter) => buildFilter("and", result, filter));
    }

filter
  = _ field:key? _ op:operator? _ value:identifier {
      if (isDefaultField(field)) {
        updateDefaultValues(field, value.trim());
        return null;
      }

      if (!field && !op) {
        return buildFilter('eq', 'keyword', value.trim());
      }

      const values = value.split(',');
      const operatorValue = op ?? 'eq';

      return values.slice(1).reduce((acc, val) => buildFilter('or', acc, buildFilter(operatorValue, field, val.trim())), buildFilter(operatorValue, field, values[0]));
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
  / "keyword" { return "keyword"; }
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
