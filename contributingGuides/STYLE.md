# Coding Standards

## Table of Contents

- [Introduction](#introduction)
- [TypeScript guidelines](#typescript-guidelines)
    - [General rules](#general-rules)
    - [`d.ts` extension](#dts-extension)
    - [Type Alias vs Interface](#type-alias-vs-interface)
    - [Enum vs. Union Type](#enum-vs-union-type)
    - [`unknown` vs. `any`](#unknown-vs-any)
    - [`T[]` vs. `Array<T>`](#t-vs-arrayt)
    - [`@ts-ignore`](#ts-ignore)
    - [Type Inference](#type-inference)
    - [Utility Types](#utility-types)
    - [`object` type](#object-type)
    - [Prop Types](#prop-types)
    - [File organization](#file-organization)
    - [Reusable Types](#reusable-types)
    - [`tsx` extension](#tsx-extension)
    - [No inline prop types](#no-inline-prop-types)
    - [Satisfies Operator](#satisfies-operator)
    - [Type imports/exports](#type-importsexports)
    - [Refs](#refs)
    - [Other Expensify Resources on TypeScript](#other-expensify-resources-on-typescript)
    - [Default value for inexistent IDs](#default-value-for-inexistent-IDs)
- [Naming Conventions](#naming-conventions)
    - [Type names](#type-names)
    - [Prop callbacks](#prop-callbacks)
    - [Event Handlers](#event-handlers)
    - [Boolean variables and props](#boolean-variables-and-props)
    - [Functions](#functions)
    - [`var`, `const` and `let`](#var-const-and-let)
- [Object / Array Methods](#object--array-methods)
- [Accessing Object Properties and Default Values](#accessing-object-properties-and-default-values)
- [JSDocs](#jsdocs)
- [Component props](#component-props)
- [Destructuring](#destructuring)
- [Named vs Default Exports in ES6 - When to use what?](#named-vs-default-exports-in-es6---when-to-use-what)
- [Classes and constructors](#classes-and-constructors)
    - [Class syntax](#class-syntax)
    - [Constructor](#constructor)
- [ESNext: Are we allowed to use [insert new language feature]? Why or why not?](#esnext-are-we-allowed-to-use-insert-new-language-feature-why-or-why-not)
- [React Coding Standards](#react-coding-standards)
    - [Code Documentation](#code-documentation)
    - [Inline Ternaries](#inline-ternaries)
    - [Function component style](#function-component-style)
    - [Forwarding refs](#forwarding-refs)
    - [Hooks and HOCs](#hooks-and-hocs)
    - [Stateless components vs Pure Components vs Class based components vs Render Props](#stateless-components-vs-pure-components-vs-class-based-components-vs-render-props---when-to-use-what)
    - [Use Refs Appropriately](#use-refs-appropriately)
    - [Are we allowed to use [insert brand new React feature]?](#are-we-allowed-to-use-insert-brand-new-react-feature-why-or-why-not)
- [Handling Scroll Issues with Nested Lists in React Native](#handling-scroll-issues-with-nested-lists-in-react-native)
    - [Wrong Approach (Using SelectionList)](#wrong-approach-using-selectionlist)
    - [Correct Approach (Using SelectionList)](#correct-approach-using-selectionlist)
- [React Hooks: Frequently Asked Questions](#react-hooks-frequently-asked-questions)
- [Onyx Best Practices](#onyx-best-practices)
    - [Collection Keys](#collection-keys)
- [Learning Resources](#learning-resources)

## Introduction

<!-- Consider removing this as we moved to TS -->
For almost all of our code style rules, refer to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

When writing ES6 or React code, please also refer to the [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react).

We use Prettier to automatically style our code.
- You can run Prettier to fix the style on all files with `npm run prettier`
- You can run Prettier in watch mode to fix the styles when they are saved with `npm run prettier-watch`

There are a few things that we have customized for our tastes which will take precedence over Airbnb's guide.

## TypeScript guidelines

### General rules

Strive to type as strictly as possible.

```ts
type Foo = {
    fetchingStatus: "loading" | "success" | "error"; // vs. fetchingStatus: string;
    person: { name: string; age: number }; // vs. person: Record<string, unknown>;
};
```

### `d.ts` Extension

Do not use `d.ts` file extension even when a file contains only type declarations. Only exceptions are `src/types/global.d.ts` and `src/types/modules/*.d.ts` files in which third party packages and JavaScript's built-in modules (e.g. `window` object) can be modified using [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation).

> Why? Type errors in `d.ts` files are not checked by TypeScript.

### Type Alias vs. Interface

Do not use `interface`. Use `type`. eslint: [`@typescript-eslint/consistent-type-definitions`](https://typescript-eslint.io/rules/consistent-type-definitions/)

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

### Enum vs. Union Type

Do not use `enum`. Use union types. eslint: [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax)

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

for (const color of COLORS) {
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

### `unknown` vs. `any`

Don't use `any`. Use `unknown` if type is not known beforehand. eslint: [`@typescript-eslint/no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any/)

> Why? `any` type bypasses type checking. `unknown` is type safe as `unknown` type needs to be type narrowed before being used.

```ts
const value: unknown = JSON.parse(someJson);
if (typeof value === 'string') {...}
else if (isPerson(value)) {...}
...
```

### `T[]` vs. `Array<T>`

Use `T[]` or `readonly T[]` for simple types (i.e. types which are just primitive names or type references). Use `Array<T>` or `ReadonlyArray<T>` for all other types (union types, intersection types, object types, function types, etc). eslint: [`@typescript-eslint/array-type`](https://typescript-eslint.io/rules/array-type/)

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

### `@ts-ignore`

Do not use `@ts-ignore` or its variant `@ts-nocheck` to suppress warnings and errors.

### Type Inference

When possible, allow the compiler to infer type of variables.

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

### Utility Types

Use types from [TypeScript utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) and [`type-fest`](https://github.com/sindresorhus/type-fest) when possible.

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

// BAD
type FooValue = Foo[keyof Foo];

// GOOD
type FooValue = ValueOf<Foo>;

```

### `object` type

Don't use `object` type. eslint: [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/)

> Why? `object` refers to "any non-primitive type," not "any object". Typing "any non-primitive value" is not commonly needed.

```ts
// BAD
const foo: object = [1, 2, 3]; // TypeScript does not error
```

If you know that the type of data is an object but don't know what properties or values it has beforehand, use `Record<string, unknown>`.

> Even though `string` is specified as a key, `Record<string, unknown>` type can still accept objects whose keys are numbers. This is because numbers are converted to strings when used as an object index. Note that you cannot use [symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for `Record<string, unknown>`.

```ts
function logObject(object: Record<string, unknown>) {
    for (const [key, value] of Object.entries(object)) {
        console.log(`${key}: ${value}`);
    }
}
```

### Prop Types

Don't use `ComponentProps` to grab a component's prop types. Go to the source file for the component and export prop types from there. Import and use the exported prop types. 

> Why? Importing prop type from the component file is more common and readable. Using `ComponentProps` might cause problems in some cases (see [related GitHub issue](https://github.com/piotrwitek/react-redux-typescript-guide/issues/170)). Each component with props has it's prop  type defined in the file anyway, so it's easy to export it when required.

Don't export prop types from component files by default. Only export it when there is a code that needs to access the prop type directly.

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

### File organization

In modules with platform-specific implementations, create `types.ts` to define shared types. Import and use shared types in each platform specific files. Do not use [`satisfies` operator](#satisfies-operator) for platform-specific implementations, always define shared types that complies with all variants.

> Why? To encourage consistent API across platform-specific implementations. If you're migrating module that doesn't have a default implementation (i.e. `index.ts`, e.g. `getPlatform`), refer to [Migration Guidelines](#migration-guidelines) for further information.

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
export default function MyComponent({ foo }: MyComponentProps) { /* ios specific implementation */ }

// index.ts
import { MyComponentProps } from "./types";

export MyComponentProps;
export default function MyComponent({ foo }: MyComponentProps) { /* Default implementation */ }
```

### Reusable Types

Reusable type definitions, such as models (e.g., Report), must have their own file and be placed under `src/types/`. The type should be exported as a default export.

```ts
// src/types/Report.ts

type Report = {...};

export default Report;
```

### `tsx` extension

Use `.tsx` extension for files that contain React syntax.

> Why? It is a widely adopted convention to mark any files that contain React specific syntax with `.jsx` or `.tsx`.

### No inline prop types

Do not define prop types inline for components that are exported.

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

### Satisfies Operator

Use the `satisfies` operator when you need to validate that the structure of an expression matches a specific type, without affecting the resulting type of the expression.

> Why? TypeScript developers often want to ensure that an expression aligns with a certain type, but they also want to retain the most specific type possible for inference purposes. The `satisfies` operator assists in doing both.

```ts
// BAD
const sizingStyles = {
    w50: {
        width: '50%',
    },
    mw100: {
        maxWidth: '100%',
    },
} as const;

// GOOD
const sizingStyles = {
    w50: {
        width: '50%',
    },
    mw100: {
        maxWidth: '100%',
    },
} as const satisfies Record<string, ViewStyle>;
```

The example above results in the most narrow type possible, also the values are `readonly`. There are some cases in which that is not desired (e.g. the variable can be modified), if so `as const` should be omitted.

### Type imports/exports

Always use the `type` keyword when importing/exporting types

> Why? In order to improve code clarity and consistency and reduce bundle size after typescript transpilation, we enforce the all type imports/exports to contain the `type` keyword. This way, TypeScript can automatically remove those imports from the transpiled JavaScript bundle 

Imports:
```ts
// BAD
import {SomeType} from './a'
import someVariable from './a'

import {someVariable, SomeOtherType} from './b'

// GOOD
import type {SomeType} from './a'
import someVariable from './a'
```

 Exports:
```ts
// BAD
export {SomeType}
export someVariable
// or 
export {someVariable, SomeOtherType}

// GOOD
export type {SomeType}
export someVariable
```

### Refs

Avoid using HTML elements while declaring refs. Please use React Native components where possible. React Native Web handles the references on its own. It also extends React Native components with [Interaction API](https://necolas.github.io/react-native-web/docs/interactions/) which should be used to handle Pointer and Mouse events. Exception of this rule is when we explicitly need to use functions available only in DOM and not in React Native, e.g. `getBoundingClientRect`. Then please declare ref type as `union` of React Native component and HTML element. When passing it to React Native component assert it as soon as possible using utility methods declared in `src/types/utils`.

Normal usage: 
```tsx
const ref = useRef<View>();

<View ref={ref} onPointerDown={e => {#DO SOMETHING}}>
```

Exceptional usage where DOM methods are necessary:
```tsx
import viewRef from '@src/types/utils/viewRef';

const ref = useRef<View | HTMLDivElement>();

if (ref.current && 'getBoundingClientRect' in ref.current) {
  ref.current.getBoundingClientRect();
}

<View ref={viewRef(ref)} onPointerDown={e => {#DO SOMETHING}}>
```

### Other Expensify Resources on TypeScript

- [Expensify TypeScript React Native CheatSheet](./TS_CHEATSHEET.md)

### Default value for inexistent IDs

 Use `'-1'` or `-1` when there is a possibility that the ID property of an Onyx value could be `null` or `undefined`.

``` ts
// BAD
const foo = report?.reportID ?? '';
const bar = report?.reportID ?? '0';

report ? report.reportID : '0';
report ? report.reportID : '';

// GOOD
const foo = report?.reportID ?? '-1';

report ? report.reportID : '-1';
```

## Naming Conventions

### Type names

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

  - Use `{ComponentName}Props` pattern for prop types.

    ```ts
    // BAD
    type Props = {
        // component's props
    };

    function MyComponent({}: Props) {
        // component's code
    }

    // GOOD
    type MyComponentProps = {
        // component's props
    };

    function MyComponent({}: MyComponentProps) {
        // component's code
    }
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

### Prop callbacks
  - Prop callbacks should be named for what has happened, not for what is going to happen. Components should never assume anything about how they will be used (that's the job of whatever is implementing it).

    ```ts
    // Bad
    type ComponentProps = {
        /** A callback to call when we want to save the form */
        onSaveForm: () => void;
    };

    // Good
    type ComponentProps = {
        /** A callback to call when the form has been submitted */
        onFormSubmitted: () => void;
    };
    ```

  * Do not use underscores when naming private methods.

### Event Handlers
  - When you have an event handler, do not prefix it with "on" or "handle". The method should be named for what it does, not what it handles. This promotes code reuse by minimizing assumptions that a method must be called in a certain fashion (eg. only as an event handler).
  - One exception for allowing the prefix of "on" is when it is used for callback `props` of a React component. Using it in this way helps to distinguish callbacks from public component methods.

    ```ts
    // Bad
    const onSubmitClick = () => {
        // Validate form items and submit form
    };

    // Good
    const validateAndSubmit = () => {
        // Validate form items and submit form
    };
    ```

### Boolean variables and props

- Boolean props or variables must be prefixed with `should` or `is` to make it clear that they are `Boolean`. Use `should` when we are enabling or disabling some features and `is` in most other cases.

```tsx
// Bad
<SomeComponent showIcon />

// Good
<SomeComponent shouldShowIcon />

// Bad
const valid = props.something && props.somethingElse;

// Good
const isValid = props.something && props.somethingElse;
```

### Functions

Any function declared in a library module should use the `function myFunction` keyword rather than `const myFunction`.

```tsx
// Bad
const myFunction = () => {...};

export {
    myFunction,
}

// Good
function myFunction() {
    ...
}

export {
    myFunction,
}
```

You can still use arrow function for declarations or simple logics to keep them readable.

```tsx
// Bad
randomList.push({
     onSelected: Utils.checkIfAllowed(function checkTask() { return Utils.canTeamUp(people); }),
});
routeList.filter(function checkIsActive(route) { 
    return route.isActive; 
});

// Good
randomList.push({
     onSelected: Utils.checkIfAllowed(() => Utils.canTeamUp(people)),
});
routeList.filter((route) => route.isActive);
const myFunction = () => {...};
const person = { getName: () => {} };
Utils.connect({
    callback: (val) => {},
});
useEffect(() => {
    if (isFocused) {
        return;
    }
    setError(null, {});
}, [isFocused]);

```

## `var`, `const` and `let`

- Never use `var`
- Use `const` when you are not reassigning a variable
- Try to write your code in a way where the variable reassignment isn't necessary
- Use `let` only if there are no other options

```tsx
// Bad
let array = [];

if (someCondition) {
    array = ['addValue1'];
}

// Good
const array = [];

if (someCondition) {
    array.push('addValue1');
}
```

## Object / Array Methods

We have standardized on using the native [Array instance methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods) instead of [lodash](https://lodash.com/) methods for objects and collections. As the vast majority of code is written in TypeScript, we can safely use the native methods.

```ts
// Bad
_.each(myArray, item => doSomething(item));
// Good
myArray.forEach(item => doSomething(item));

// Bad
const myArray = _.map(someObject, (value, key) => doSomething(value));
// Good
const myArray = Object.keys(someObject).map((key) => doSomething(someObject[key]));

// Bad
_.contains(myCollection, 'item');
// Good
myCollection.includes('item');

// Bad
const modifiedArray = _.chain(someArray)
    .filter(filterFunc)
    .map(mapFunc)
    .value();
// Good
const modifiedArray = someArray.filter(filterFunc).map(mapFunc);
```

## Accessing Object Properties and Default Values

Use optional chaining (`?.`) to safely access object properties and nullish coalescing (`??`) to short circuit null or undefined values that are not guaranteed to exist in a consistent way throughout the codebase. Don't use the `lodashGet()` function. eslint: [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)

```ts
// BAD
import lodashGet from "lodash/get";
const name = lodashGet(user, "name", "default name");

// BAD
const name = user?.name || "default name";

// GOOD
const name = user?.name ?? "default name";
```

## JSDocs

- Omit comments that are redundant with TypeScript. Do not declare types in `@param` or `@return` blocks. Do not write `@implements`, `@enum`, `@private`, `@override`. eslint: [`jsdoc/no-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/.README/rules/no-types.md)
- Only document params/return values if their names are not enough to fully understand their purpose. Not all parameters or return values need to be listed in the JSDoc comment. If there is no comment accompanying the parameter or return value, omit it.
- When specifying a return value use `@returns` instead of `@return`. 
- Avoid descriptions that don't add any additional information. Method descriptions should only be added when it's behavior is unclear.
- Do not use block tags other than `@param` and `@returns` (e.g. `@memberof`, `@constructor`, etc).
- Do not document default parameters. They are already documented by adding them to a declared function's arguments.
- Do not use record types e.g. `{Object.<string, number>}`.

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
 * @returns Whether the person is a legal drinking age or nots
 */
function canDrink(age: number): boolean {
    return age >= 21;
}
```

In the above example, because the parameter `age` doesn't have any accompanying comment, it is completely omitted from the JSDoc.

## Component props

Do not use **`propTypes` and `defaultProps`**: . Use object destructing and assign a default value to each optional prop unless the default values is `undefined`.

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

## Destructuring
We should avoid using object destructuring in situations where it reduces code clarity. Here are some general guidelines on destructuring.

**General Guidelines**

- Avoid object destructuring for a single variable that you only use *once*. It's clearer to use dot notation for accessing a single variable.

```ts
// Bad
const {data} = event.data;

// Good
const {name, accountID, email} = data;
```

## Named vs Default Exports in ES6 - When to use what?

ES6 provides two ways to export a module from a file: `named export` and `default export`. Which variation to use depends on how the module will be used.

- If a file exports a single JS object (e.g. a React component, or an IIFE), then use `export default`
- Files with multiple exports should always use named exports
- Files with a single method or variable export are OK to use named exports
- Mixing default and named exports in a single file is OK (e.g. in a self contained module), but should rarely be used
- All exports (both default and named) should happen at the bottom of the file
- Do **not** export individual features inline.

```ts
// Bad
export const something = 'nope';
export const somethingElse = 'stop';

// Good
const something = 'yep';
const somethingElse = 'go';

export {
    something,
    somethingElse,
};
```

## Classes and constructors

### Class syntax
Using the `class` syntax is preferred wherever appropriate. Airbnb has clear [guidelines](https://github.com/airbnb/javascript#classes--constructors) in their JS style guide which promotes using the _class_ syntax. Don't manipulate the `prototype` directly. The `class` syntax is generally considered more concise and easier to understand.

### Constructor
Classes have a default constructor if one is not specified. No need to write a constructor function that is empty or just delegates to a parent class.

```js
// Bad
class Jedi {
    constructor() {}

    getName() {
        return this.name;
    }
}

// Bad
class Rey extends Jedi {
    constructor(...args) {
        super(...args);
    }
}

// Good
class Rey extends Jedi {
    constructor(...args) {
        super(...args);
        this.name = 'Rey';
    }
}
```

## ESNext: Are we allowed to use [insert new language feature]? Why or why not?

JavaScript is always changing. We are excited whenever it does! However, we tend to take our time considering whether to adopt the latest and greatest language features. The main reason for this is **consistency**. We have a style guide so that we don't have to have endless conversations about how our code looks and can focus on how it runs.

So, if a new language feature isn't something we have agreed to support it's off the table. Sticking to just one way to do things reduces cognitive load in reviews and also makes sure our knowledge of language features progresses at the same pace. If a new language feature will cause considerable effort for everyone to adapt to or we're just not quite sold on the value of it yet, we won't support it.

Here are a couple of things we would ask that you *avoid* to help maintain consistency in our codebase:

- **Async/Await** - Use the native `Promise` instead

## React Coding Standards

### Code Documentation

* Add descriptions to all component props using a block comment above the definition. No need to document the types, but add some context for each property so that other developers understand the intended use.

```tsx
// Bad
type ComponentProps = {
    currency: string;
    amount: number;
    isIgnored: boolean;
};

// Bad
type ComponentProps = {
    // The currency that the reward is in
    currency: string;

    // The amount of reward
    amount: number;

    // If the reward has been ignored or not
    isIgnored: boolean;
}

// Good
type ComponentProps = {
    /** The currency that the reward is in */
    currency: string;

    /** The amount of the reward */
    amount: number;

    /** If the reward has not been ignored yet */
    isIgnored: boolean;
}
```

### Inline Ternaries
* Use inline ternary statements when rendering optional pieces of templates. Notice the white space and formatting of the ternary.

```tsx
// Bad
{
    const optionalTitle = props.title ? <div className="title">{props.title}</div> : null;
    return (
        <div>
            {optionalTitle}
            <div className="body">This is the body</div>
        </div>
    );
}
```

```tsx
// Good
{
    return (
        <div>
            {props.title
                ? <div className="title">{props.title}</div>
                : null}
            <div className="body">This is the body</div>
        </div>
    );
}
```

```tsx
// Good
{
    return (
        <div>
            {props.title
                ? <div className="title">{props.title}</div>
                : <div className="title">Default Title</div>
            }
            <div className="body">This is the body</body>
        </div>
    );
}
```

#### Important Note:

In React Native, one **must not** attempt to falsey-check a string for an inline ternary. Even if it's in curly braces, React Native will try to render it as a `<Text>` node and most likely throw an error about trying to render text outside of a `<Text>` component. Use `!!` instead.

```tsx
// Bad! This will cause a breaking an error on native platforms
{
    return (
        <View>
            {props.title
                ? <View style={styles.title}>{props.title}</View>
                : null}
            <View style={styles.body}>This is the body</View>
        </View>
    );
}

// Good
{
    return (
        <View>
            {!!props.title
                ? <View style={styles.title}>{props.title}</View>
                : null}
            <View style={styles.body}>This is the body</View>
        </View>
    );
}
```

### Function component style

When writing a function component, you must ALWAYS add a `displayName` property and give it the same value as the name of the component (this is so it appears properly in the React dev tools)

```tsx
function Avatar(props: AvatarProps) {...};

Avatar.displayName = 'Avatar';

export default Avatar;
```

### Forwarding refs

When forwarding a ref define named component and pass it directly to the `forwardRef`. By doing this, we remove potential extra layer in React tree in the form of anonymous component.

```tsx
import type {ForwarderRef} from 'react';

type FancyInputProps = {
    ...
};

function FancyInput(props: FancyInputProps, ref: ForwardedRef<TextInput>) {
    ...
    return <input {...props} ref={ref} />
};

export default React.forwardRef(FancyInput)
```

If the ref handle is not available (e.g. `useImperativeHandle` is used) you can define a custom handle type above the component.

```tsx 
import type {ForwarderRef} from 'react';
import {useImperativeHandle} from 'react';

type FancyInputProps = {
    ...
    onButtonPressed: () => void;
};

type FancyInputHandle = {
  onButtonPressed: () => void;
}

function FancyInput(props: FancyInputProps, ref: ForwardedRef<FancyInputHandle>) {
    useImperativeHandle(ref, () => ({onButtonPressed}));

    ...
    return <input {...props} ref={ref} />;
};

export default React.forwardRef(FancyInput)
```

### Hooks and HOCs

Use hooks whenever possible, avoid using HOCs.

> Why? Hooks are easier to use (can be used inside the function component), and don't need nesting or `compose` when exporting the component. It also allows us to remove `compose` completely in some components since it has been bringing up some issues with TypeScript. Read the [`compose` usage](#compose-usage) section for further information about the TypeScript issues with `compose`.

Onyx now provides a `useOnyx` hook that should be used over `withOnyx` HOC.

```tsx
// BAD
type ComponentOnyxProps = {
    session: OnyxEntry<Session>;
};

type ComponentProps = ComponentOnyxProps & {
    someProp: string;
};

function Component({session, someProp}: ComponentProps) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    // component's code
}

export default withOnyx<ComponentProps, ComponentOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Component);

// GOOD
type ComponentProps = {
    someProp: string;
};

function Component({someProp}: ComponentProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION)

    const {windowWidth, windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    // component's code
}
```

### Stateless components vs Pure Components vs Class based components vs Render Props - When to use what?

Class components are DEPRECATED. Use function components and React hooks.

[https://react.dev/reference/react/Component#migrating-a-component-with-lifecycle-methods-from-a-class-to-a-function](https://react.dev/reference/react/Component#migrating-a-component-with-lifecycle-methods-from-a-class-to-a-function)

### Use Refs Appropriately

React's documentation explains refs in [detail](https://reactjs.org/docs/refs-and-the-dom.html). It's important to understand when to use them and how to use them to avoid bugs and hard to maintain code.

A common mistake with refs is using them to pass data back to a parent component higher up the chain. In most cases, you can try [lifting state up](https://reactjs.org/docs/lifting-state-up.html) to solve this.

There are several ways to use and declare refs and we prefer the [callback method](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs).

### Are we allowed to use [insert brand new React feature]? Why or why not?

We love React and learning about all the new features that are regularly being added to the API. However, we try to keep our organization's usage of React limited to the most stable set of features that React offers. We do this mainly for **consistency** and so our engineers don't have to spend extra time trying to figure out how everything is working. That said, if you aren't sure if we have adopted something, please ask us first.


# Handling Scroll Issues with Nested Lists in React Native

## Problem

When using `SelectionList` alongside other components (e.g., `Text`, `Button`), wrapping them inside a `ScrollView` can lead to alignment and performance issues. Additionally, using `ScrollView` with nested `FlatList` or `SectionList` causes the error:

> "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation."

## Solution

The correct approach is avoid using `ScrollView`. You can add props like `listHeaderComponent` and `listFooterComponent` to add other components before or after the list while keeping the layout scrollable.

## Wrong Approach (Using `SelectionList`)

```jsx
<ScrollView>
    <Text>Header Content</Text>
    <SelectionList
        sections={[{data}]}
        ListItem={RadioListItem}
        onSelectRow={handleSelect}
    />
    <Button title="Submit" onPress={handleSubmit} />
</ScrollView>
```

## Correct Approach (Using `SelectionList`)

```jsx
<SelectionList 
    sections={[{item}]} 
    ListItem={RadioListItem} 
    onSelectRow={handleSelect}
    listHeaderComponent={<Text>Header Content</Text>}
    listFooterComponent={<Button title="Submit" onPress={handleSubmit} />}
/>
```

This ensures optimal performance and avoids layout issues.


## React Hooks: Frequently Asked Questions

### Are Hooks a Replacement for HOCs or Render Props?

In most cases, a custom hook is a better pattern to use than an HOC or Render Prop. They are easier to create, understand, use and document. However, there might still be a case for a HOC e.g. if you have a component that abstracts some conditional rendering logic.

### Should I wrap all my inline functions with `useCallback()` or move them out of the component if they have no dependencies?

The answer depends on whether you need a stable reference for the function. If there are no dependencies, you could move the function out of the component. If there are dependencies, you could use `useCallback()` to ensure the reference updates only when the dependencies change. However, it's important to note that using `useCallback()` may have a performance penalty, although the trade-off is still debated. You might choose to do nothing at all if there is no obvious performance downside to declaring a function inline. It's recommended to follow the guidance in the [React documentation](https://react.dev/reference/react/useCallback#should-you-add-usecallback-everywhere) and add the optimization only if necessary. If it's not obvious why such an optimization (i.e. `useCallback()` or `useMemo()`) would be used, leave a code comment explaining the reasoning to aid reviewers and future contributors.

### Why does `useState()` sometimes get initialized with a function?

React saves the initial state once and ignores it on the next renders. However, if you pass the result of a function to `useState()` or call a function directly e.g. `useState(doExpensiveThings())` it will *still run on every render*. This can hurt performance depending on what work the function is doing. As an optimization, we can pass an initializer function instead of a value e.g. `useState(doExpensiveThings)` or `useState(() => doExpensiveThings())`.

### Is there an equivalent to `componentDidUpdate()` when using hooks?

The short answer is no. A longer answer is that sometimes we need to check not only that a dependency has changed, but how it has changed in order to run a side effect. For example, a prop had a value of an empty string on a previous render, but now is non-empty. The generally accepted practice is to store the "previous" value in a `ref` so the comparison can be made in a `useEffect()` call.

### Are `useCallback()` and `useMemo()` basically the same thing?

No! It is easy to confuse `useCallback()` with a memoization helper like `_.memoize()` or `useMemo()` but they are really not the same at all. [`useCallback()` will return a cached function _definition_](https://react.dev/reference/react/useCallback) and will not save us any computational cost of running that function. So, if you are wrapping something in a `useCallback()` and then calling it in the render, then it is better to use `useMemo()` to cache the actual **result** of calling that function and use it directly in the render.

### What is the `exhaustive-deps` lint rule? Can I ignore it?

A `useEffect()` that does not include referenced props or state in its dependency array is [usually a mistake](https://legacy.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) as often we want effects to re-run when those dependencies change. However, there are some cases where we might actually only want to re-run the effect when only some of those dependencies change. We determined the best practice here should be to allow disabling the “next line” with a comment `//eslint-disable-next-line react-hooks/exhaustive-deps` and an additional comment explanation so the next developer can understand why the rule was not used.

### Should I declare my components with arrow functions (`const`) or the `function` keyword?

There are pros and cons of each, but ultimately we have standardized on using the `function` keyword to align things more with modern React conventions. There are also some minor cognitive overhead benefits in that you don't need to think about adding and removing brackets when encountering an implicit return. The `function` syntax also has the benefit of being able to be hoisted where arrow functions do not.

### How do I auto-focus a TextInput using `useFocusEffect()`?

```tsx
const focusTimeoutRef = useRef(null);

useFocusEffect(useCallback(() => {
    focusTimeoutRef.current = setTimeout(() => textInputRef.current.focus(), CONST.ANIMATED_TRANSITION);
    return () => {
        if (!focusTimeoutRef.current) {
            return;
        }
        clearTimeout(focusTimeoutRef.current);
    };
}, []));
```

This works better than using `onTransitionEnd` because -
1. `onTransitionEnd` is only fired for the top card in the stack, and therefore does not fire on the new top card when popping a card off the stack. For example - pressing the back button to go from the workspace invite page to the workspace members list.
2. Using `InteractionsManager.runAfterInteractions` with `useFocusEffect` will interrupt an in-progress transition animation.

Note - This is a solution from [this PR](https://github.com/Expensify/App/pull/26415). You can find detailed discussion in comments.

## Onyx Best Practices

[Onyx Documentation](https://github.com/expensify/react-native-onyx)

### Collection Keys

Our potentially larger collections of data (reports, policies, etc) are typically stored under collection keys. Collection keys let us group together individual keys vs. storing arrays with multiple objects. In general, **do not add a new collection key if it can be avoided**. There is most likely a more logical place to put the state. And failing to associate a state property with its logical owner is something we consider to be an anti-pattern (unnecessary data structure adds complexity for no value).

For example, if you are storing a boolean value that could be associated with a `report` object under a new collection key, it is better to associate this information with the report itself and not create a new collection key.

**Exception:** There are some [gotchas](https://github.com/expensify/react-native-onyx#merging-data) when working with complex nested array values in Onyx. So, this could be another valid reason to break a property off of its parent object (e.g. `reportActions` are easier to work with as a separate collection).

If you're not sure whether something should have a collection key reach out in [`#expensify-open-source`](https://expensify.slack.com/archives/C01GTK53T8Q) for additional feedback.

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
