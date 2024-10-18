
operator "operator"
  = (":" / "=") { return "eq"; }
  / "!=" { return "neq"; }
  / ">=" { return "gte"; }
  / ">" { return "gt"; }
  / "<=" { return "lte"; }
  / "<" { return "lt"; }

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
  = chars:[A-Za-z0-9_@./#&+\-\\',;%]+ {
      return chars.join("").trim().split(",").filter(Boolean);
    }

logicalAnd = _ { return "and"; }

_ "whitespace" = [ \t\r\n]*
