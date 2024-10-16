// This files defines the grammar that's used by [Peggy](https://peggyjs.org/) to generate the searchParser.js file.
// The searchParser is setup to parse our custom search syntax and output an AST with the filters.
//
// Here's a general grammar structure:
//
// query: entry point for the parser and rule to process the values returned by the filterList rule. Takes filters as an argument and returns the final AST output.
// filterList: rule to process the array of filters returned by the filter rule. It takes head and tail as arguments, filters it for null values and builds the AST.
// filter: abstract rule to simplify the filterList rule. It takes all filter types.
// defaultFilter: rule to process the default values returned by the defaultKey rule. It updates the default values object.
// freeTextFilter: rule to process the free text search values returned by the identifier rule. It builds filter Object.
// standardFilter: rule to process the values returned by the key rule. It builds filter Object.
// operator: rule to match pre-defined search syntax operators, e.g. !=, >, etc
// key: rule to match pre-defined search syntax fields, e.g. amount, merchant, etc
// defaultKey: rule to match pre-defined search syntax fields that are used to update default values, e.g. type, status, etc
// identifier: composite rule to match patterns defined by the quotedString and alphanumeric rules
// quotedString: rule to match a quoted string pattern, e.g. "this is a quoted string"
// alphanumeric: rule to match unquoted alphanumeric characters, e.g. a-z, 0-9, _, @, etc
// logicalAnd: rule to match whitespace and return it as a logical 'and' operator
// whitespace: rule to match whitespaces

// global initializer (code executed only once)
{{
  function buildFilter(operator, left, right) {
    return { operator, left, right };
  }
}}

// per-parser initializer (code executed before every parse)
{
  const defaultValues = {
    type: "expense",
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  };

  function applyDefaults(filters) {
    return {
      ...defaultValues,
      filters,
    };
  }

  function updateDefaultValues(field, value) {
    defaultValues[field] = value;
  }
}

query = _ filters:filterList? _ { return applyDefaults(filters); }

filterList
  = head:filter tail:(logicalAnd filter)* {
      const allFilters = [head, ...tail.map(([_, filter]) => filter)]
        .filter(Boolean)
        .filter((filter) => filter.right);
      if (!allFilters.length) {
        return null;
      }

      const keywords = allFilters.filter(
        (filter) =>
          filter.left === "keyword" || filter.right?.left === "keyword"
      );
      const nonKeywords = allFilters.filter(
        (filter) =>
          filter.left !== "keyword" && filter.right?.left !== "keyword"
      );

      const keywordFilter = buildFilter(
        "eq",
        "keyword",
        keywords.map((filter) => filter.right).flat()
      );
      if (keywordFilter.right.length > 0) {
        nonKeywords.push(keywordFilter);
      }
      return nonKeywords.reduce((result, filter) =>
        buildFilter("and", result, filter)
      );
    }

filter = @(standardFilter / defaultFilter / freeTextFilter)

defaultFilter
  = _ key:defaultKey _ op:operator _ value:identifier {
      updateDefaultValues(key, value);
    }

freeTextFilter
  = _ value:identifier _ { return buildFilter("eq", "keyword", value); }

standardFilter
  = _ field:key _ op:operator _ values:identifier {
      return buildFilter(op, field, values);
    }

operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

key "key"
  = @(
      "date"
      / "amount"
      / "merchant"
      / "description"
      / "reportID"
      / "keyword"
      / "in"
      / "currency"
      / "tag"
      / "category"
      / "to"
      / "taxRate"
      / "cardID"
      / "from"
      / "expenseType"
    )

defaultKey "default key"
  = @("type" / "status" / "sortBy" / "sortOrder" / "policyID")

identifier
  = parts:(quotedString / alphanumeric)+ {
      const value = parts.flat();
      if (value.length > 1) {
        return value;
      }
      return value[0];
    }

quotedString "quote" = "\"" chars:[^"\r\n]* "\"" { return chars.join(""); }

alphanumeric "word"
  = chars:[^ "\t\n\r]+ {
      return chars.join("").trim().split(",").filter(Boolean);
    }

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n]*
