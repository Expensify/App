# Syntax-only hosted rules

<!-- cspell:ignore Florian -->

These generated modules retain the rules Oxlint cannot run natively without installing a JavaScript
TypeScript compiler. They are **rule implementations**, not compiler or parser API replacements.
`build.mjs` checks the source versions and rejects generated imports of compiler-dependent packages.
The committed modules run directly; neither installation nor linting rebuilds them.

| npm source | Version | Included code | License |
| --- | --- | --- | --- |
| `eslint-config-expensify` | `4.0.8` | Enabled custom rules, their constants and AST helpers | ISC |
| `@typescript-eslint/eslint-plugin` | `8.58.1` | `naming-convention` and its validators | MIT |
| `@typescript-eslint/utils` | `8.61.0` | Compiler-free AST utilities and rule option defaults | MIT |
| `eslint-plugin-testing-library` | `7.11.0` | The eight enabled rules and their detection helpers | MIT |
| `eslint-plugin-storybook` | `10.6.2` | Storybook rule implementations | MIT |

The MIT notices are beside these modules. `eslint-config-expensify` is authored by
Florian Weber (`florian@expensify.com`) and Expensify and declares the ISC license:

> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee
> is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE
> INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE
> FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
> OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING
> OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Deliberate adaptations

- Expensify's disabled `boolean-conditional-rendering` and `prefer-at` rules are not loaded. The existing
  `unicorn/prefer-at` rule and `preferLocaleCompareFromContext.mjs` implementation remain configured.
- The naming rule uses Babel's identifier predicates instead of compiler scanner helpers, preserving
  the rule's UTF-16 code-unit iteration rather than treating surrogate pairs as Unicode code points.
  App's configuration has no type or unused modifiers. Those selectors fail explicitly if introduced;
  they are not silently ignored. All other naming checks and diagnostic messages are retained.
- Testing Library and Storybook use the same compiler-free AST predicates, scope utilities, rule
  defaults and ESLint utility functions, without importing the compiler-dependent utilities entry point.

## Rebuilding

Use `npm pack <package>@<version>` for the five source packages above and unpack each tarball into a
temporary directory laid out like `node_modules` (including the `@typescript-eslint` scope).
No install or peer dependency override is needed in that source directory. Then, from App:

```sh
node config/oxlint/vendor/build.mjs /absolute/path/to/unpacked-packages
```

Review the generated diff and rerun the existing custom-rule tests and the full lint diagnostic
comparison before updating a source version. Keep the generated files and their license notices together.
