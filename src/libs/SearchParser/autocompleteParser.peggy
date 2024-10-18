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
  = _ key:autocompleteKey _ op:operator _ value:identifier? {
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

autocompleteKey "key"
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
