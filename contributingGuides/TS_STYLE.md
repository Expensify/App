# Expensify TypeScript Style Guide

## Table of Contents

- [Other Expensify Resources on TypeScript](#other-expensify-resources-on-typescript)
- [Learning Resources](#learning-resources)
- [Exception to Rules](#exception-to-rules)
- [General Rules](#general-rules)
- [Guidelines](#guidelines)
  - [1.1 Naming Conventions](#naming-conventions)
  - [1.2 `d.ts` Extension](#d-ts-extension)
  - [1.3 Type Alias vs. Interface](#type-alias-vs-interface)
  - [1.4 Enum vs. Union Type](#enum-vs-union-type)
  - [1.5 `unknown` vs. `any`](#unknown-vs-any)
  - [1.6 `T[]` vs. `Array<T>`](#array)
  - [1.7 @ts-ignore](#ts-ignore)
  - [1.8 Optional chaining and nullish coalescing](#ts-nullish-coalescing)
  - [1.9 Type Inference](#type-inference)
  - [1.10 JSDoc](#jsdoc)
  - [1.11 `propTypes` and `defaultProps`](#proptypes-and-defaultprops)
  - [1.12 Utility Types](#utility-types)
  - [1.13 `object` Type](#object-type)
  - [1.14 Export Prop Types](#export-prop-types)
  - [1.15 File Organization](#file-organization)
  - [1.16 Reusable Types](#reusable-types)
  - [1.17 `.tsx`](#tsx)
  - [1.18 No inline prop types](#no-inline-prop-types)
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
  - [TypeScript CheatSheet](https://www.typescriptlang.org/cheatsheets)
    - [Type](https://www.typescriptlang.org/static/TypeScript%20Types-ae199d69aeecf7d4a2704a528d0fd3f9.png)
    - [Control Flow Analysis](https://www.typescriptlang.org/static/TypeScript%20Control%20Flow%20Analysis-8a549253ad8470850b77c4c5c351d457.png)
- TypeScript with React
  - [React TypeScript CheatSheet](https://react-typescript-cheatsheet.netlify.app/)
    - [List of built-in utility types](https://react-typescript-cheatsheet.netlify.app/docs/basic/troubleshooting/utilities)
    - [HOC CheatSheet](https://react-typescript-cheatsheet.netlify.app/docs/hoc/)

## Exception to Rules

Most of the rules are enforced in ESLint or checked by TypeScript. If you think your particular situation warrants an exception, post the context in the `#expensify-open-source` Slack channel with your message prefixed with `TS EXCEPTION:`. Internal engineers will assess the case and suggest alternative or grants an exception. When an exception is granted, link the relevant Slack conversation in your pull request. Suppress ESLint or TypeScript warnings/errors with comments if necessary.

This rule will apply until the migration is done. After the migration, exceptions are assessed and granted by PR reviewers.

## General Rules

Strive to type as strictly as possible.

```ts
type Foo = {
  fetchingStatus: "loading" | "success" | "error"; // vs. fetchingStatus: string;
  person: { name: string; age: number }; // vs. person: Record<string, unknown>;
};
```

## Guidelines

<a name="naming-conventions"></a><a name="1.1"></a>

- [1.1](#naming-conventions) **Naming Conventions**: Follow naming conventions specified below

  - Use PascalCase for type names. eslint: [`@typescript-eslint/naming-convention`](https://typescript-eslint.io/rules/naming-convention/)

    ```ts
    // BAD
    type foo = ...;
    type BAR = ...;

    // GOOD
    type Foo = ...;
    type Bar = ...;
    ```

  - Do not postfix type aliases with `Type`.

    ```ts
    // BAD
    type PersonType = ...;

    // GOOD
    type Person = ...;
    ```

  - Use singular name for union types.

    ```ts
    // BAD
    type Colors = "red" | "blue" | "green";

    // GOOD
    type Color = "red" | "blue" | "green";
    ```

  - For generic type parameters, use `T` if you have only one type parameter. Don't use the `T`, `U`, `V`... sequence. Make type parameter names descriptive, each prefixed with `T`.

    > Prefix each type parameter name to distinguish them from other types.

    ```ts
    // BAD
    type KeyValuePair<T, U> = { key: K; value: U };

    type Keys<Key> = Array<Key>;

    // GOOD
    type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };

    type Keys<T> = Array<T>;
    type Keys<TKey> = Array<TKey>;
    ```

<a name="d-ts-extension"></a><a name="1.2"></a>

- [1.2](#d-ts-extension) **`d.ts` Extension**: Do not use `d.ts` file extension even when a file contains only type declarations. Only exception is the `global.d.ts` file in which third party packages can be modified using module augmentation. Refer to the [Communication Items](#communication-items) section to learn more about module augmentation.

  > Why? Type errors in `d.ts` files are not checked by TypeScript [^1].

[^1]: This is because `skipLibCheck` TypeScript configuration is set to `true` in this project.

<a name="type-alias-vs-interface"></a><a name="1.3"></a>

- [1.3](#type-alias-vs-interface) **Type Alias vs. Interface**: Do not use `interface`. Use `type`. eslint: [`@typescript-eslint/consistent-type-definitions`](https://typescript-eslint.io/rules/consistent-type-definitions/)

  > Why? In TypeScript, `type` and `interface` can be used interchangeably to declare types. Use `type` for consistency.

  ```ts
  // BAD
  interface Person {
    name: string;
  }

  // GOOD
  type Person = {
    name: string;
  };
  ```

<a name="enum-vs-union-type"></a><a name="1.4"></a>

- [1.4](#enum-vs-union-type) **Enum vs. Union Type**: Do not use `enum`. Use union types. eslint: [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax)

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

<a name="unknown-vs-any"></a><a name="1.5"></a>

- [1.5](#unknown-vs-any) **`unknown` vs. `any`**: Don't use `any`. Use `unknown` if type is not known beforehand. eslint: [`@typescript-eslint/no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any/)

  > Why? `any` type bypasses type checking. `unknown` is type safe as `unknown` type needs to be type narrowed before being used.

  ```ts
  const value: unknown = JSON.parse(someJson);
  if (typeof value === 'string') {...}
  else if (isPerson(value)) {...}
  ...
  ```

<a name="array"></a><a name="1.6"></a>

- [1.6](#array) **`T[]` vs. `Array<T>`**: Use `T[]` or `readonly T[]` for simple types (i.e. types which are just primitive names or type references). Use `Array<T>` or `ReadonlyArray<T>` for all other types (union types, intersection types, object types, function types, etc). eslint: [`@typescript-eslint/array-type`](https://typescript-eslint.io/rules/array-type/)

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

<a name="ts-ignore"></a><a name="1.7"></a>

- [1.7](#ts-ignore) **@ts-ignore**: Do not use `@ts-ignore` or its variant `@ts-nocheck` to suppress warnings and errors.

  > Use `@ts-expect-error` during the migration for type errors that should be handled later. Refer to the [Migration Guidelines](#migration-guidelines) for specific instructions on how to deal with type errors during the migration. eslint: [`@typescript-eslint/ban-ts-comment`](https://typescript-eslint.io/rules/ban-ts-comment/)

<a name="ts-nullish-coalescing"></a><a name="1.8"></a>

- [1.8](#ts-nullish-coalescing) **Optional chaining and nullish coalescing**: Use optional chaining and nullish coalescing instead of the `get` lodash function. eslint: [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)

  ```ts
  // BAD
  import lodashGet from "lodash/get";
  const name = lodashGet(user, "name", "default name");

  // GOOD
  const name = user?.name ?? "default name";
  ```

<a name="type-inference"></a><a name="1.9"></a>

- [1.9](#type-inference) **Type Inference**: When possible, allow the compiler to infer type of variables.

  ```ts
  // BAD
  const foo: string = "foo";
  const [counter, setCounter] = useState<number>(0);

  // GOOD
  const foo = "foo";
  const [counter, setCounter] = useState(0);
  const [username, setUsername] = useState<string | undefined>(undefined); // Username is a union type of string and undefined, and its type cannot be inferred from the default value of undefined
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

<a name="jsdoc"></a><a name="1.10"></a>

- [1.10](#jsdoc) **JSDoc**: Omit comments that are redundant with TypeScript. Do not declare types in `@param` or `@return` blocks. Do not write `@implements`, `@enum`, `@private`, `@override`. eslint: [`jsdoc/no-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/.README/rules/no-types.md)

  ```ts
  // BAD
  /**
   * @param {number} age
   * @returns {boolean} Whether the person is a legal drinking age or nots
   */
  function canDrink(age: number): boolean {
    return age >= 21;
  }

  // GOOD
  /**
   * @param age
   * @returns Whether the person is a legal drinking age or nots
   */
  ```

<a name="proptypes-and-defaultprops"></a><a name="1.11"></a>

- [1.11](#proptypes-and-defaultprops) **`propTypes` and `defaultProps`**: Do not use them. Use object destructing to assign default values if necessary.

  > Refer to [the propTypes Migration Table](./PROPTYPES_CONVERSION_TABLE.md) on how to type props based on existing `propTypes`.

  ```tsx
  type MyComponentProps = {
    requiredProp: string;
    optionalPropWithDefaultValue?: number;
    optionalProp?: boolean;
  };

  function MyComponent({
    requiredProp,
    optionalPropWithDefaultValue = 42,
    optionalProp,
  }: MyComponentProps) {
    // component's code
  }
  ```

<a name="utility-types"></a><a name="1.12"></a>

- [1.12](#utility-types) **Utility Types**: Use types from [TypeScript utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) and [`type-fest`](https://github.com/sindresorhus/type-fest) when possible.

  ```ts
  type Foo = {
    bar: string;
  };

  // BAD
  type ReadOnlyFoo = {
    readonly [Property in keyof Foo]: Foo[Property];
  };

  // GOOD
  type ReadOnlyFoo = Readonly<Foo>;
  ```

<a name="object-type"></a><a name="1.13"></a>

- [1.13](#object-type) **`object`**: Don't use `object` type. eslint: [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/)

  > Why? `object` refers to "any non-primitive type," not "any object". Typing "any non-primitive value" is not commonly needed.

  ```ts
  // BAD
  const foo: object = [1, 2, 3]; // TypeScript does not error
  ```

  If you know that the type of data is an object but don't know what properties or values it has beforehand, use `Record<string, unknown>`.

  > Even though `string` is specified as a key, `Record<string, unknown>` type can still accepts objects whose keys are numbers. This is because numbers are converted to strings when used as an object index. Note that you cannot use [symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for `Record<string, unknown>`.

  ```ts
  function logObject(object: Record<string, unknown>) {
    for (const [key, value] of Object.entries(object)) {
      console.log(`${key}: ${value}`);
    }
  }
  ```

<a name="export-prop-types"></a><a name="1.14"></a>

- [1.14](#export-prop-types) **Prop Types**: Don't use `ComponentProps` to grab a component's prop types. Go to the source file for the component and export prop types from there. Import and use the exported prop types.

  > Don't export prop types from component files by default. Only export it when there is a code that needs to access the prop type directly.

  ```tsx
  // MyComponent.tsx
  export type MyComponentProps = {
    foo: string;
  };

  export default function MyComponent({ foo }: MyComponentProps) {
    return <Text>{foo}</Text>;
  }

  // BAD
  import { ComponentProps } from "React";
  import MyComponent from "./MyComponent";
  type MyComponentProps = ComponentProps<typeof MyComponent>;

  // GOOD
  import MyComponent, { MyComponentProps } from "./MyComponent";
  ```

<a name="file-organization"></a><a name="1.15"></a>

- [1.15](#file-organization) **File organization**: In modules with platform-specific implementations, create `types.ts` to define shared types. Import and use shared types in each platform specific files.

  > Why? To encourage consistent API across platform-specific implementations. If you're migrating module that doesn't have a default implement (i.e. `index.ts`, e.g. `getPlatform`), refer to [Migration Guidelines](#migration-guidelines) for further information.

  Utility module example

  ```ts
  // types.ts
  type GreetingModule = {
    getHello: () => string;
    getGoodbye: () => string;
  };

  // index.native.ts
  import { GreetingModule } from "./types";
  function getHello() {
    return "hello from mobile code";
  }
  function getGoodbye() {
    return "goodbye from mobile code";
  }
  const Greeting: GreetingModule = {
    getHello,
    getGoodbye,
  };
  export default Greeting;

  // index.ts
  import { GreetingModule } from "./types";
  function getHello() {
    return "hello from other platform code";
  }
  function getGoodbye() {
    return "goodbye from other platform code";
  }
  const Greeting: GreetingModule = {
    getHello,
    getGoodbye,
  };
  export default Greeting;
  ```

  Component module example

  ```ts
    // types.ts
    export type MyComponentProps = {
      foo: string;
    }

    // index.ios.ts
    import { MyComponentProps } from "./types";

    export MyComponentProps;
    export default function MyComponent({ foo }: MyComponentProps) {...}

    // index.ts
    import { MyComponentProps } from "./types";

    export MyComponentProps;
    export default function MyComponent({ foo }: MyComponentProps) {...}
  ```

<a name="reusable-types"></a><a name="1.16"></a>

- [1.16](#reusable-types) **Reusable Types**: Reusable type definitions, such as models (e.g., Report), must have their own file and be placed under `src/types/`. The type should be exported as a default export.

  ```ts
  // src/types/Report.ts

  type Report = {...};

  export default Report;
  ```

  <a name="tsx"></a><a name="1.17"></a>

- [1.17](#tsx) **tsx**: Use `.tsx` extension for files that contain React syntax.

  > Why? It is a widely adopted convention to mark any files that contain React specific syntax with `.jsx` or `.tsx`.

  <a name="no-inline-prop-types"></a><a name="1.18"></a>

- [1.18](#no-inline-prop-types) **No inline prop types**: Do not define prop types inline for components that are exported.

  > Why? Prop types might [need to be exported from component files](#export-prop-types). If the component is only used inside a file or module and not exported, then inline prop types can be used.

  ```ts
  // BAD
  export default function MyComponent({ foo, bar }: { foo: string, bar: number }){
    // component implementation
  };

  // GOOD
  type MyComponentProps = { foo: string, bar: number };
  export default MyComponent({ foo, bar }: MyComponentProps){
    // component implementation
  }
  ```

## Communication Items

> Comment in the `#expensify-open-source` Slack channel if any of the following situations are encountered. Each comment should be prefixed with `TS ATTENTION:`. Internal engineers will access each situation and prescribe solutions to each case. Internal engineers should refer to general solutions to each situation that follows each list item.

- I think types definitions in a third party library is incomplete or incorrect

When the library indeed contains incorrect or missing type definitions and it cannot be updated, use module augmentation to correct them. All module augmentation code should be contained in `/src/global.d.ts`.

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

- If you're migrating a module that doesn't have a default implementation (i.e. `index.ts`, e.g. `getPlatform`), convert `index.website.js` to `index.ts`. Without `index.ts`, TypeScript cannot get type information where the module is imported.

- Deprecate the usage of `underscore`. Use the corresponding methods from `lodash`. eslint: [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)

- Found type bugs. Now what?

  If TypeScript migration uncovers a bug that has been “invisible,” there are two options an author of a migration PR can take

  - Fix issues if they are minor. Document each fix in the PR comment
  - Suppress a TypeScript error stemming from the bug with `@ts-expect-error`. Create a separate GH issue. Prefix the issue title with `[TS ERROR #<issue-number-of-migration-PR>]`. Cross-link the migration PR and the created GH issue. On the same line as `@ts-expect-error`, put down the GH issue number prefixed with `TODO:`.

  > The `@ts-expect-error` annotation tells the TS compiler to ignore any errors in the line that follows it. However, if there's no error in the line, TypeScript will also raise an error.

  ```ts
  // @ts-expect-error TODO: #21647
  const x: number = "123"; // No TS error raised

  // @ts-expect-error
  const y: number = 123; // TS error: Unused '@ts-expect-error' directive.
  ```
