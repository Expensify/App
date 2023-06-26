# Expensify TypeScript Style Guide

## Table of Contents

- [Other Expensify Resources on TypeScript](#other-expensify-resources-on-typescript)
- [Learning Resources](#learning-resources)
- [Exception to Rules](#exception-to-rules)
- [1.1 Naming Conventions](#convension-naming-convension)
- [1.2 `d.ts` Extension](#convensions-d-ts-extension)
- [1.3 Type Alias vs. Interface](#convensions-type-alias-vs-interface)
- [1.4 Enum vs. Union Type](#convensions-enum-vs-union-type)
- [1.5 `unknown` vs. `any`](#convensions-unknown-vs-any)
- [1.6 `T[]` vs. `Array<T>`](#convensions-array)
- [1.7 @ts-ignore](#convension-ts-ignore)
- [1.8 Optional chaining and nullish coalescing](#convension-ts-nullish-coalescing)
- [1.9 Type Inference](#convension-type-inference)
- [1.10 JSDoc](#conventions-jsdoc)
- [1.11 `propTypes` and `defaultProps`](#convension-proptypes-and-defaultprops)
- [1.12 Utility Types](#convension-utility-types)
- [1.13 `object` Type](#convension-object-type)
- [1.14 Export Prop Types](#convension-export-prop-types)
- [Communication Items](#communication-items)
- [Migration Guidelines](#migration-guidelines)

## Other Expensify Resources on TypeScript

- [Expensify TypeScript React Native CheatSheet](./TS_CHEATSHEET.md)
- [Expensify TypeScript PropTypes Conversion Table](./PROPTYPES_CONVERSION_TABLE.md)

## Learning Resources

### Quickest way to learn TypeScript

- Get up to speed quickly
  - [TypeScript playground](https://www.typescriptlang.org/play?q=231#example)
    - Go though all examples on the playground. Click on "Example" tab on the top
- Handy Reference
  - [TypeScript CheatSheet](https://www.typescriptlang.org/static/TypeScript%20Types-ae199d69aeecf7d4a2704a528d0fd3f9.png)
    - [Type](https://www.typescriptlang.org/static/TypeScript%20Types-ae199d69aeecf7d4a2704a528d0fd3f9.png)
    - [Control Flow Analysis](https://www.typescriptlang.org/static/TypeScript%20Control%20Flow%20Analysis-8a549253ad8470850b77c4c5c351d457.png)
- TypeScript with React
  - [React TypeScript CheatSheet](https://react-typescript-cheatsheet.netlify.app/)
    - [List of built-in utility types](https://react-typescript-cheatsheet.netlify.app/docs/basic/troubleshooting/utilities)
    - [HOC CheatSheet](https://react-typescript-cheatsheet.netlify.app/docs/hoc/)

## Exception to Rules

Most of the rules are enforced in ESLint or checked by TypeScript. If you think your particular situation warrants an exception, post the context in the `#expensify-open-source` Slack channel with your message prefixed with `TS EXCEPTION:`. Internal engineers will assess the case and suggest alternative or grants an exception. When an exception is granted, link the relevant Slack conversation in your pull request. Suppress ESLint or TypeScript warnings/errors with comments if necessary.

This rule will apply until the migration is done. After the migration, exceptions are assessed and granted by PR reviewers.

## Guidelines

<a name="convension-naming-convension"></a><a name="1.1"></a>

- [1.1](#convension-naming-convension) **Naming Conventions**: Use PascalCase for type names. Do not postfix type aliases with `Type`

  ```ts
  // bad
  type foo = ...;
  type BAR = ...;
  type PersonType = ...;

  // good
  type Foo = ...;
  type Bar = ...;
  type Person = ...;
  ```

<a name="convensions-d-ts-extension"></a><a name="1.2"></a>

- [1.2](#convensions-d-ts-extension) **`d.ts` Extension**: Do not use `d.ts` file extension even when a file contains only type declarations.

  > Why? Type errors in `d.ts` files are not checked by TypeScript [^1].

[^1]: This is because `skipLibCheck` TypeScript configuration is set to `true` in this project.

<a name="convensions-type-alias-vs-interface"></a><a name="1.3"></a>

- [1.3](#convensions-type-alias-vs-interface) **Type Alias vs. Interface**: Do not use `interface`. Use `type`.

  > Why? In TypeScript, `type` and `interface` can be used interchangeably to declare types. Use `type` for consistency.

  ```ts
  // bad
  interface Person {
    name: string;
  }

  // good
  type Person = {
    name: string;
  };
  ```

<a name="convensions-enum-vs-union-type"></a><a name="1.4"></a>

- [1.4](#convensions-enum-vs-union-type) **Enum vs. Union Type**: Do not use `enum`. Use union types.

  > Why? Enums come with several [pitfalls](https://blog.logrocket.com/why-typescript-enums-suck/). Most enum use cases can be replaced with union types.

  ```ts
  // Most simple form of union type.
  type Color = "red" | "green" | "blue";
  function printColors(color: Color) {
    console.log(color);
  }

  // When the values need to be iterated upon.
  import { TupleToUnion } from "type-fest";

  const COLORS = ["red", "green", "blue"] as const;
  type Color = TupleToUnion<typeof COLORS>; // type: 'red' | 'green' | 'blue'

  for (const colors of color) {
    printColor(color);
  }

  // When the values should be accessed through object keys. (i.e. `COLORS.Red` vs. `"red"`)
  import { ValueOf } from "type-fest";

  const COLORS = {
    Red: "red",
    Green: "green",
    Blue: "blue",
  } as const;
  type Color = ValueOf<typeof COLORS>; // type: 'red' | 'green' | 'blue'

  printColor(COLORS.Red);
  ```

<a name="convensions-unknown-vs-any"></a><a name="1.5"></a>

- [1.5](#convensions-unknown-vs-any) **`unknown` vs. `any`**: Don't use `any`. Use `unknown` if type is not known beforehand

  > Why? `any` type bypasses type checking. `unknown` is type safe as `unknown` type needs to be type narrowed before being used.

  ```ts
  const value: unknown = JSON.parse(someJson);
  if (typeof value === 'string') {...}
  else if (isPerson(value)) {...}
  ...
  ```

<a name="convensions-array"></a><a name="1.6"></a>

- [1.6](#convensions-array) **`T[]` vs. `Array<T>`**: Use T[] or readonly T[] for simple types (i.e. types which are just primitive names or type references). Use Array<T> or ReadonlyArray<T> for all other types (union types, intersection types, object types, function types, etc).

  ```ts
  // Array<T>
  const a: Array<string | number> = ["a", "b"];
  const b: Array<{ prop: string }> = [{ prop: "a" }];
  const c: Array<() => void> = [() => {}];

  // T[]
  const d: MyType[] = ["a", "b"];
  const e: string[] = ["a", "b"];
  const f: readonly string[] = ["a", "b"];
  ```

<a name="convension-ts-ignore"></a><a name="1.7"></a>

- [1.7](#convension-ts-ignore) **@ts-ignore**: Do not use `@ts-ignore` or its variant `@ts-nocheck` to suppress warnings and errors. Use `@ts-expect-error` during the migration for type errors that should be handled later.

<a name="convension-ts-nullish-coalescing"></a><a name="1.8"></a>

- [1.8](#convension-ts-nullish-coalescing) **Optional chaining and nullish coalescing**: Use optional chaining and nullish coalescing instead of the `get` lodash function.

  ```ts
  // Bad
  import { get } from "lodash";
  const name = lodashGet(user, "name", "default name");

  // Good
  const name = user?.name ?? "default name";
  ```

<a name="convension-type-inference"></a><a name="1.9"></a>

- [1.9](#convension-type-inference) **Type Inference**: When possible, allow the compiler to infer type of variables.

  ```ts
  // Bad
  const foo: string = "foo";
  const [counter, setCounter] = useState<number>(0);

  // Good
  const foo = "foo";
  const [counter, setCounter] = useState(0);
  const [username, setUsername] = useState<string | undefined>(undefined); // Username is a union type of string and undefined, and its type cannot be interred from the default value of undefined
  ```

  For function return types, default to always typing them unless a function is simple enough to reason about its return type.

  > Why? Explicit return type helps catch errors when implementation of the function changes. It also makes it easy to read code even when TypeScript intellisense is not provided.

  ```ts
  function simpleFunction(name: string) {
    return `hello, ${name}`;
  }

  function complicatedFunction(name: string): boolean {
    // ... some complex logic here ...
    return foo;
  }
  ```

<a name="conventions-jsdoc"></a><a name="1.10"></a>

- [1.10](#conventions-jsdoc) **JSDoc**: Omit comments that are redundant with TypeScript. Do not declare types in `@param` or `@return` blocks. Do not write `@implements`, `@enum`, `@private`, `@override`

  ```ts
  // bad
  /**
   * @param {number} age
   * @returns {boolean} Whether the person is a legal drinking age or nots
   */
  function canDrink(age: number): boolean {
    return age >= 21;
  }

  // good
  /**
   * @param age
   * @returns Whether the person is a legal drinking age or nots
   */
  ```

<a name="convension-proptypes-and-defaultprops"></a><a name="1.11"></a>

- [1.11](#convension-proptypes-and-defaultprops) **`propTypes` and `defaultProps`**: Do not use them. Use object destructing to assign default values if necessary.

  > Refer to [the propTypes Migration Table](./PROPTYPES_CONVERSION_TABLE.md) on how to type props based on existing `propTypes`.

  ```tsx
  type GreetingProps = {
    greeting: string;
    name: string;
  };

  function Greeting({ greeting = "hello", name = "world" }: ComponentProps) {
    <Text>{`${greeting}, ${name}`}</Text>;
  }
  ```

<a name="convension-utility-types"></a><a name="1.12"></a>

- [1.12](#convension-utility-types) **Utility Types**: Use types from [TypeScript utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) and [`type-fest`](https://github.com/sindresorhus/type-fest) when possible.

  ```ts
  type Foo = {
    bar: string;
  };

  // good
  type ReadOnlyFoo = Readonly<Foo>;

  // bad
  type ReadOnlyFoo = {
    readonly [Property in keyof Foo]: Foo[Property];
  };
  ```

<a name="convension-object-type"></a><a name="1.13"></a>

- [1.13](#convension-object-type) **`object`**: Don't use `object` type.

> Why? `object` refers to "any non-primitive type," not "any object". Typing "any non-primitive value" is not commonly needed.

```ts
// bad
const foo: object = [1, 2, 3]; // TypeScript does not error
```

If you know that the type of data is an object but don't know what properties or values it has beforehand, use `Record<string, unknown>`.

<a name="convension-export-prop-types"></a><a name="1.14"></a>

- [1.14](#convension-export-prop-types) **Prop Types**: Define and export prop types for components. Use exported prop types instead of grabbing the prop type from a component.

> Why? Exporting prop types aids reusability.

```tsx
// MyComponent.tsx
export type MyComponentProps = {
  foo: string;
};

export default function MyComponent({ foo }: MyComponentProps) {
  return <Text>{foo}</Text>;
}

// bad
import { ComponentProps } from "React";
import MyComponent from "./MyComponent";
type MyComponentProps = ComponentProps<typeof MyComponent>;

// good
import MyComponent, { MyComponentProps } from "./MyComponent";
```

## Communication Items

> Comment in the `#expensify-open-source` Slack channel if any of the following situations are encountered. Each comment should be prefixed with `TS ATTENTION:`. Internal engineers will access each situation and prescribe solutions to each case. Internal engineers should refer to general solutions to each situation that follows each list item.

- I think types definitions in a third party library is incomplete or incorrect

  When the library indeed contains incorrect type definitions and it cannot be updated, use module argumentation to correct them.

  ```ts
  declare module "external-library-name" {
    interface LibraryComponentProps {
      // Add or modify typings
      additionalProp: string;
    }
  }
  ```

## Migration Guidelines

> This section contains instructions that are applicable during the migration.

- Found type bugs. Now what?

  If TypeScript migration uncovers a bug that has been “invisible,” there are two options an author of a migration PR can take

  - Fix issues if they are minor. Document each fix in the PR comment
  - Suppress a TypeScript error stemming from the bug with `@ts-expect-error`. Create a separate GH issue. Prefix the issue title with `[TS ERROR #<issue-number-of-migration-PR>]`. Cross-link the migration PR and the created GH issue

  The `@ts-expect-error` annotation tells the TS compiler to ignore any errors in the line that follows it. However, if there's no error in the line, TypeScript will also raise an error.

  ```ts
  // @ts-expect-error
  const x: number = "This is a string"; // No TS error raised

  // @ts-expect-error
  const y: number = 123; // TS error: Unused '@ts-expect-error' directive.
  ```
