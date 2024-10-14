{
  const defaults = {
    autocomplete: null,
  };

  function applyAutocomplete(ranges) {
    return {
      ...defaults,
      ranges,
    };
  }

  function updateAutocomplete(value) {
    defaults.autocomplete = value;
  }
}

query = _ filters:filterList? _ { return applyAutocomplete(filters); }

filterList
  = head:filter tail:(logicalAnd filter)* {
      const allFilters = [head, ...tail.map(([_, filter]) => filter)].filter(
        Boolean
      );
      return allFilters.flat();
    }

filter = @(defaultFilter / freeTextFilter)

defaultFilter
  = _ key:key _ op:operator _ value:identifier? {
      if (!value) {
        updateAutocomplete({
          key,
          value: null,
          start: location().end.offset,
          length: 0,
        });
        return;
      } else {
        updateAutocomplete({
          key,
          ...value[value.length - 1],
        });
      }

      return value.map(({ start, length }) => ({
        key,
        start,
        length,
      }));
    }

freeTextFilter = _ value:identifier _ { updateAutocomplete(null); }

operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

key "key"
  = @(
      "in"
      / "currency"
      / "tag"
      / "category"
      / "to"
      / "taxRate"
      / "from"
      / "expenseType"
      / "type"
      / "status"
    )

identifier
  = parts:(quotedString / alphanumeric)+ {
      const ends = location();
      const value = parts.flat();
      let count = ends.start.offset;
      const result = [];
      value.forEach((filter) => {
        result.push({
          value: filter,
          start: count,
          length: filter.length,
        });
        count += filter.length + 1;
      });
      return result;
    }

quotedString "quote" = "\"" chars:[^"\r\n]* "\"" { return chars.join(""); }

alphanumeric "word"
  = chars:[A-Za-z0-9_@./#&+\-\\',;:%]+ {
      return chars.join("").trim().split(",");
    }

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n]*