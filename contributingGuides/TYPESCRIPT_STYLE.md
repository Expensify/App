# TypeScript Coding Standards

For our Javascript code style rules, refer to the [JavaScript Style Guide](STYLE.md). 

You can also refer to [the TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) for more information on how to use TypeScript.

## Organizing Type Definitions

### File structure

- Reusable type definitions, such as models (e.g. Report), must have their own file and be placed in a shared directory, e.g. `src/types/`.
- Types specific to a single file should remain inside that file to keep their scope limited and their usage clear.
- Types specific to a component/file with platform-specific variants should have their own file and be placed in the same folder.

### File Extensions

For TypeScript files containing JSX code, use the `.tsx` file extension. For other TypeScript code use the `.ts` file extension.

Files containing only type declarations should **not** use the `.d.ts` extension. The only exception is when defining a common interface for platform-specific implementations (see below).

### Platform-Specific Variants

Platform-specific TypeScript files follow the same naming conventions as [JavaScript](https://github.com/Expensify/App#platform-specific-file-extensions) files, except with the `.ts`/`.tsx` extension instead of `.js`.

For each platform-specific module, create shared type definitions in a separate `types.ts` file and place it in the same folder. `types.ts` has to export shared types which are **compatible with all platform-specific implementations**. Declare component props, return types, and other common types in this file.

```ts
type ComponentProps = {
    foo: string;
    bar: number;
};

type Helpers = {
    doSomething: () => void;
};

export type { ComponentProps, Helpers };
```

In case there is no default implementation, you have to create a `index.d.ts` declaration file. When importing the module from other files, TypeScript will automatically pick up the type definitions from `index.d.ts`. Be careful when defining `index.d.ts` as declaration files aren't checked by the TypeScript compiler (with `skipLibCheck: true` - [source](https://www.typescriptlang.org/tsconfig#skipLibCheck)).

Example with a default implementation:

```ts
// types.ts
type VisibilityInterface = {
    isVisible: () => boolean;
    hasFocus: () => boolean;
};

export default VisibilityInterface;

// index.ts
function isVisible() {
    return document.visibilityState === 'visible';
}

function hasFocus() {
    return document.hasFocus();
}

const Visibility: VisibilityInterface = {
    isVisible,
    hasFocus,
};

export default Visibility;

// index.native.ts
function isVisible() {
    return AppState.currentState === 'active';
}

function hasFocus() {
    return true;
}

const Visibility: VisibilityInterface = {
    isVisible,
    hasFocus,
};

export default Visibility;
```

Example with no default implementation:

```ts
// types.ts
type Platform = 'android' | 'ios' | 'web' | 'desktop';
export default Platform;

// index.d.ts
export default function getPlatform(): Platform;

// index.ios.ts
export default function getPlatform(): Platform {
  return "ios";
}

// index.android.ts
export default function getPlatform(): Platform {
  return "android";
}

// index.desktop.ts
export default function getPlatform(): Platform {
  return "desktop";
}

// index.website.ts
export default function getPlatform(): Platform {
  return "website";
}
```

Refer to the React Native documentation for more information about [Platform Specific Code](https://reactnative.dev/docs/platform-specific-code).

## Naming Conventions

Use **PascalCase** for class, type, interface, and enum names, as well as enum members and type parameters (generics). This improves readability and conforms to widely accepted TypeScript standards.


```ts
// Bad
class someService {}
type some_type = number | string;
interface some_interface {}
enum some_enum { some_value }
function example<Some_type>(): Some_type {}

// Good
class SomeService {}
type SomeType = number | string;
interface SomeInterface {}
enum SomeEnum { SomeValue }
function example<SomeType>(): SomeType {}
```

Use **camelCase** for variables, parameters, functions, methods, properties, and module aliases.

```ts
// Bad
const user_Name = "John";
function process_Data(input_data: string) {}
class BadExample {
  do_Work() {}
  WorkDone: boolean;
}
import * as Some_Module from "some-module";

// Good
const userName = "John";
function processData(inputData: string) {}
class GoodExample {
  doWork() {}
  workDone: boolean;
}
import * as someModule from "some-module";

```

Use **CONSTANT_CASE** for global constant values to distinguish them from other variables and emphasize their fixed state.
```ts
// Bad
const someConst = { config: “value” } as const;

// Good
const SOME_CONST = { config: “value” } as const;
```

Avoid using common generic words such as data, state, amount, number, value, manager, engine, object, entity, instance, helper, util, broker, metadata, process, handle, and context.

Especially do not include "Type" at the end of your type files and definitions. 
 
```ts
// Bad: ReportType.ts
// Good: Report.ts

// Bad
type ReportType = {
    // properties
}

// Good
type Report = {
    // properties
}
```

Remove any words that are already clear from the variable's type declaration.

```ts
// Bad
let nameString: string;
let holidayDateList: Date[];

// Good
let name: string;
let holidays: Date[];
```

Don't include overly specific names that make the code harder to read.

```ts
// Bad
type Weather = {
  weatherApiTemperature: number;
  weatherApiCity: string;
}

// Good
type Weather = {
  temperature: number;
  city: string;
}
```

## Types and Interfaces

Use **type** by default.

```ts
// Bad
interface Report {
    // properties
}

// Good
type Report = {
    // properties
}
```

TypeScript supports both type and interface expressions. Types can be used more broadly: to name primitives, unions, objects and any other type. As these two forms are practically equivalent, it's best to select one over the other to maintain consistency and reduce variation.

One drawback of using interfaces is that they can be declared multiple times and are merged. This can lead to unintended behavior.

```ts
// Merging interfaces
interface Foo {
  a: number;
}
interface Foo {
  b: number;
}

// Foo is now { a: number; b: number; }
```

Use interfaces only when you encounter a situation where `type` does not fulfill your requirements. Example scenario is when you need to modify or extend an interface from a third-party library that lacks typings or has incorrect typings. 

When extending or correcting interfaces from third-party libraries, always use [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) to maintain code consistency and avoid potential issues, and declare it inside the `global.d.ts` file.

```ts
// Third-party library with missing or incorrect typings
interface LibraryComponentProps {
  // Existing incorrect or incomplete typings
}

// Your code
declare module 'library/path' {
  interface LibraryComponentProps {
    // Add or modify the typings
    additionalProp: string;
  }
}
```

## Enums and Union Types

Use **union types** instead of enums. Opt for union types whenever possible. Union types provide flexibility and can handle varying data types and dynamic value sets.

```ts
// Bad
enum Colors {
  Red,
  Green,
  Blue
}

// Good
type Colors = 'red' | 'green' | 'blue';
```
You can also define a union type by deriving the type from an array. It's a great choice when seeking an easily iterable and directly usable array in code while keeping one source of truth.

```ts
// Bad
const COLORS = ['red', 'green', 'blue'] as const;
type Colors = 'red' | 'green' | 'blue';

// Good
import { TupleToUnion } from 'type-fest';

const COLORS = ['red', 'green', 'blue'] as const;
type Colors = TupleToUnion<typeof COLORS>;
```

Defining union types using an object offers several benefits. This approach it's a great choice when **enum-like identifiers are needed**, while maintaining one source of truth and improving readability.

```ts
// Bad
const COLORS = {
    Red: 'red',
    Green: 'green',
    Blue: 'blue',
} as const;
type Colors = 'red' | 'green' | 'blue';

// Good
import { ValueOf } from 'type-fest';

const COLORS = {
    Red: 'red',
    Green: 'green',
    Blue: 'blue',
} as const;
type Colors = ValueOf<typeof COLORS>
```

If using enum is necessary, utilize string enum. Do not use numeric and heterogenous enums as they auto increment its numeric values in unexpected ways, are hard to understand when they have mixed value types and have reverse mappings. This can help prevent potential bugs at runtime.

```ts
// Bad
enum Colors1 {
  Red,   // when not assigning anything, the value will start with 0.
  Green, // and will increment, 1.
  Blue,  // 2.
}

enum Colors2 {
  Red = 10,            // 10.
  Green,               // will increment to 11.
  Blue = 30,           // 30.
  Yellow,              // same, will increment to 31.
  Magenta = 'magenta', // "magenta".
  Brown = 100,         // 100.
  Black,               // 101.
}

// Bad - We also end up having reverse mappings when using numeric values in enums.
Colors2.Green; // 11.
Colors2[11];   // "Green".

// Good
enum Colors {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}
```

## Usage of type `any` and `unknown`

Usage of `any` is forbidden unless there is a very good reason for it. The `any` type bypasses the TypeScript type-checking system, thus making the code less safe and more prone to bugs. Any usage of `any` type must be followed with a comment explaining why you are using it.

```ts
// Bad
function processAPIResponse(response: any) {
    // your code
}

// Good
// As we are just going to persist the response in Onyx and
// it would be very hard to type all possible data structures,
// we just leave `response` as `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processAPIResponse (response: any) {
    // your code
}
```

The `any` type allows assignment to all types and dereference of any property, which is undesirable and should be avoided. Instead, and in most cases, use the `unknown` type which expresses a similar concept and is much safer as it requires narrowing the type before using it. 

When you know that the type structure is a object but you don't have context about the content, use `Record<string, unknown>`. Note that numeric keys are allowed with the `Record<string, unknown>` type. Numeric keys are implicitly converted to strings during property assignment and access. To read more about this, see [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/2/objects.html#dynamically-adding-properties).

```ts
// Bad
const danger: any = 'danger';
danger.invalidProperty // No TypeScript error, but will be `undefined` at runtime
danger.invalidProperty.nestedInvalidProperty // No TypeScript error, but will throw TypeError at runtime

// Good
const safer: unknown = 'safer';

// Using `unknown` requires type narrowing before access
safer.nonExistentProperty // TypeScript error, forces proper type checking

// Narrowing the type before access
if (typeof safer === 'string') {
    safer.toUpperCase(); // Allowed after narrowing the type
}
```

## TypeScript Annotations

### Usage of `@ts-expect-error`

The `@ts-expect-error` annotation tells the TS compiler to ignore any errors in the following line. However, if there's no error on the following line, TypeScript will raise an error about the comment itself.

```ts
// @ts-expect-error
const x: number = 'This is a string'; // No TS error raised

// @ts-expect-error
const y: number = 123; // TS error: Unused '@ts-expect-error' directive.
```

During migration, it is expected to find TS errors revealing underlying JS issues. Treat significant errors as separate issues linked to the TS migration issue, unless the fix is minor and verifiable (document it in the PR). Use `@ts-expect-error` for such cases.

### Usage of `@ts-ignore`

The `@ts-ignore` annotation will act in the same way that `@ts-expect-error` does, with the difference that it won't raise an error in the comment if there isn't errors anymore in the code, and for this reason it should not be used. If the usage of `@ts-ignore` cannot be avoided for rare situations, explain the reason in a comment.

## Optional chaining and nullish coalescing

Avoid utilizing `lodashGet` in the future. When working with TypeScript files, opt for the combination of optional chaining (`?.`) and nullish coalescing (`??`) rather than using `lodashGet`.

```ts
// Bad
const name = lodashGet(user, 'name', 'Unknown');

// Good
const name = user?.name ?? 'Unknown';
```

## Type inference

Code may rely on type inference as implemented by the TypeScript compiler for all type expressions (variables, fields, return types, etc).

```ts
// Bad
const name: string = 'name';
const [counter, setCounter] = useState<number>(0);

// Good
const name = 'name';
const [counter, setCounter] = useState(0);

// In this case I need to specify the type because `hint` state can be either a `string` or `undefined`.
const [hint, setHint] = useState<string | undefined>(undefined);
```

### Parameter and return types

For function parameter types, depending on the clarity of the function use inferred types. Provide explicit typing when it enhances code readability.

```tsx
// Bad
function Component() {
  return (
    <TextInput onChangeText={(newTextValue: string) => setTextValue(newTextValue)} />
  );
}

// Good
function Component() {
  return (
    <TextInput onChangeText={(newTextValue) => setTextValue(newTextValue)} />
  );
}
```

Benefits of explicitly typing return values:
- More precise documentation to benefit readers of the code.
- Surface potential type errors faster in the future if there are code changes that change the return type of the function.

```ts
type User = {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

// Bad
const getUsersSummary = (users: User[], minAge: number, isActive: boolean) => {
  return users
    .filter(user => user.age >= minAge && user.active === isActive)
    .map(user => `${user.name} (${user.age})`);
};

// Good
const getUsersSummary = (users: User[], minAge: number, isActive: boolean): string[] => {
  return users
    .filter(user => user.age >= minAge && user.active === isActive)
    .map(user => `${user.name} (${user.age})`);
};
```

## Const assertions

Const assertions allow you to get more specific types for your constants. TypeScript will infer the most specific type for literals, making them `readonly` and removing wider types. 

Always use const assertions when declaring global constant values.

```ts
// Bad
const SOMETHING = {
    // ...
};

// Good
const SOMETHING = {
    // ...
} as const;
```

## Types during error handling

Errors in try/catch clauses are typed as `unknown`, if the developer needs to use the error data they must conditionally check the type of the data first. Use `instanceof` to ensure your error object is an `Error` before accessing its properties.

```ts
try {
    // your code
} catch (e) { // At this point, the type of `e` is `unknown`.
    if (e instanceof Error) {
        // Now I can safely access all properties from `e` because
        // I ensured `e` is an `Error` object.
        console.error(e.message);
    }
}
```

### Custom type guards

A type guard is a check that narrows the type of a variable within a certain scope.

The `typeof` keyword must be used when you need to narrow the type to primitive structures, like `string` or `number`.

```ts
function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        return Array(padding + 1).join(" ") + value;
    }
    if (typeof padding === "string") {
        return padding + value;
    }
    throw new Error(`Expected string or number, got '${padding}'.`);
}

padLeft("Hello world", 4); // returns "    Hello world"
```

We can also create user-defined type guards which are functions that perform a runtime check that guarantees the type in a certain scope. 

```ts
type PolicyRoomReport = {
    type: 'policyRoom';
    id: string;
    roomId: string;
};

type PolicyExpenseChatReport = {
    type: 'policyExpenseChat';
    id: string;
    expenseChatId: string;
};

type ChatReport = PolicyRoomReport | PolicyExpenseChatReport;

function isPolicyRoomReport(report: ChatReport): report is PolicyRoomReport {
    return report.type === 'policyRoom';
}

if (isPolicyRoomReport(report)) {
    // I'm guaranteed to have access to PolicyRoomReport's properties e.g. "roomId".
    // report.roomId
} else {
    // If this is not a PolicyRoomReport, then I'm guaranteed that this is a PolicyExpenseChatReport, so I'll have access to it's properties e.g. "expenseChatId"
    // report.expenseChatId
}
```

In this example, we have the `ChatReport` type which can be two possible types of object, `PolicyRoomReport` or `PolicyExpenseChatReport`. The `isPolicyRoomReport` function accepts `report` as a parameter and its return type is a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), which means that it will narrow the type of `report` to `PolicyRoomReport` if the condition inside it is `true`, and to `PolicyExpenseChatReport` if the condition is `false`.

## Typing arrays

To type arrays, use `T[]` for simple types (i.e. types which are just primitive names or type references). Use `Array<T>` for all other types (union types, intersection types, object types, function types, etc).

```ts
// T[]
const items: Item[] = [];
const labels: string[] = ['name', 'city'];
const indexes: number[] = [1, 2, 3];

// Array<T>
const items: Array<Partial<Item>> = [];
const ids: Array<string | number> = ['some_id', 42];
const colors: Array<ValueOf<typeof COLORS>> = [];
```

## Usage of “defaultProps”

To achieve better and safer typing of components with default prop values, all usages `defaultProps` shall be removed and replaced by prop destructuring. Please head to **Typing components** section to understand how you can convert your implementation.

## JSDoc annotations

JSDoc is a markup language used to annotate JavaScript files. Using comments containing JSDoc, developers can add documentation describing the application programming interface of the code they are creating.

While useful in a JS project, JSDoc will not add any value to our project anymore as we are using TypeScript to provide type check and safety now.

With that in mind, we shall remove all JSDoc annotations that specify which kind of object is expected or returned, as they won’t be necessary anymore.

```ts
// Bad
/**
 * Do something.
 * @param {Boolean} param1
 * @returns {Boolean}
 */
function fooMethod(param1) {
    return !param1;
}

// Good
/**
 * Do something.
 */
function fooMethod(param1: boolean) {
    return !param1;
}
```

## Typing Components

### Transitioning from PropTypes to TypeScript

TypeScript provides a more efficient and comprehensive solution for managing prop types in our codebase. When developing new components or updating existing ones to TypeScript, do not use PropTypes. Instead, use `types` to define the structure of your component's props.

When converting a `propTypes` object to a `type`, use the following table to help and guide you in the process:

| PropTypes                                                            | TypeScript                              | Instructions                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PropTypes.any`                                                      | `T`, `Record<string, unknown>` or `any` | Figure out what would be the correct data type and use it.<br><br>If you know that it's a object but isn't possible to determine the internal structure, use `Record<string, unknown>`.<br><br>As a last resource, use `any` and leave a comment explaining the reason.                                           |
| `PropTypes.array` or `PropTypes.arrayOf(T)`                          | `T[]` or `Array<T>`                     | Convert to `T[]` or `Array<T>`, where `T` is the data type of the array.<br><br>If `T` isn't a primitive type, create a separate `type` for the object structure of your prop and use it.                                                                                                                         |
| `PropTypes.bool`                                                     | `boolean`                               | Convert to `boolean`.                                                                                                                                                                                                                                                                                             |
| `PropTypes.func`                                                     | `(args: any) => any`                    | Convert to the function signature of your prop e.g. `(value: string) => void`.                                                                                                                                                                                                                                    |
| `PropTypes.number`                                                   | `number`                                | Convert to `number`.                                                                                                                                                                                                                                                                                              |
| `PropTypes.object`, `PropTypes.shape(T)` or `PropTypes.exact(T)`     | `T`                                     | If `T` isn't a primitive type, create a separate `type` for the `T` object structure of your prop and use it.<br><br>If you want an empty object, use `EmptyObject` from `type-fest` library.<br><br>If you want an object but isn't possible to determine the internal structure, use `Record<string, unknown>`. |
| `PropTypes.objectOf(T)`                                              | `Record<string, T>`                     | Convert to a `Record<string, T>` where `T` is the data type of your dictionary.<br><br>If `T` isn't a primitive type, create a separate `type` for the object structure and use it.                                                                                                                               |
| `PropTypes.string`                                                   | `string`                                | Convert to `string`.                                                                                                                                                                                                                                                                                              |
| `PropTypes.node`                                                     | `React.ReactNode`                       | Convert to `React.ReactNode`.                                                                                                                                                                                                                                                                                     |
| `PropTypes.element`                                                  | `React.ReactElement`                    | Convert to `React.ReactElement`.                                                                                                                                                                                                                                                                                  |
| `PropTypes.symbol`                                                   | `symbol`                                | Convert to `symbol`.                                                                                                                                                                                                                                                                                              |
| `PropTypes.elementType`                                              | `React.ElementType`                     | Convert to `React.ElementType`.                                                                                                                                                                                                                                                                                   |
| `PropTypes.instanceOf(T)`                                            | `T`                                     | Convert to `T`.                                                                                                                                                                                                                                                                                                   |
| `PropTypes.oneOf([T, U, ...])` or `PropTypes.oneOfType([T, U, ...])` | `T \| U \| ...`                         | Convert to a union type e.g. `T \| U \| ...`.                                                                                                                                                                                                                                                                     |

```ts
// Before
const propTypes = {
    unknownData: PropTypes.any,
    anotherUnknownData: PropTypes.any,
    indexes: PropTypes.arrayOf(PropTypes.number),
    items: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
    })),
    shouldShowIcon: PropTypes.bool,
    onChangeText: PropTypes.func,
    count: PropTypes.number,
    session: PropTypes.shape({
        authToken: PropTypes.string,
        accountID: PropTypes.number,
    }),
    errors: PropTypes.objectOf(PropTypes.string),
    inputs: PropTypes.objectOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
    })),
    label: PropTypes.string,
    anchor: PropTypes.node,
    footer: PropTypes.element,
    uniqSymbol: PropTypes.symbol,
    icon: PropTypes.elementType,
    date: PropTypes.instanceOf(Date),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};

// After
type Item = {
    value: string;
    label: string;
};

type Session = {
    authToken: string;
    accountID: number;
};

type Input = {
    id: string;
    label: string;
};

type Size = 'small' | 'medium' | 'large';

type Props = {
    unknownData: string[];

    // It's not possible to infer the data as it can be anything because of reasons X, Y and Z.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    anotherUnknownData: any;

    indexes: number[];
    items: Item[];
    shouldShowIcon: boolean;
    onChangeText: (value: string) => void;
    count: number;
    session: Session;
    errors: Record<string, string>;
    inputs: Record<string, Input>;
    label: string;
    anchor: React.ReactNode;
    footer: React.ReactElement;
    uniqSymbol: symbol;
    icon: React.ElementType;
    date: Date;
    size: Size;
};
```

Please note that you may encounter some PropTypes marked as `isRequired`, but when migrating to `type` you shall first consider all PropTypes as required ones and then inspect the component's source code and usage to identify which ones are really required or optional.

```ts
// Before
const propTypes = {
    isVisible: PropTypes.bool.isRequired,
    // `confirmText` prop is not marked as required here, theoretically it is optional.
    confirmText: PropTypes.string,
};

// After
type Props = {
    isVisible: boolean;
    // Consider it as required unless you have proof that it is indeed an optional prop.
    confirmText: string;
};
```

### Default props

As **defaultProps** are not allowed anymore in the project, use object destructuring in your `Props` in order to set default values to them. The props that have default value must also be marked as optional in your `Props` type.

```tsx
// Before
const propTypes = {
    requiredProp: PropTypes.string.isRequired,
    optionalPropWithDefaultValue: PropTypes.number,
    optionalProp: PropTypes.bool,
}

const defaultProps = {
    optionalPropWithDefaultValue: 42,
};

function Foo(props) {
    // your component's code
}

Foo.propTypes = propTypes;
Foo.defaultProps = defaultProps;

export default Foo;

// After
type Props = {
    requiredProp: string;
    optionalPropWithDefaultValue?: number;
    optionalProp?: boolean;
}

function Foo({ requiredProp, optionalPropWithDefaultValue = 42, optionalProp }: Props) {
    // your component's code
}

export default Foo;
```

### Style props

When converting or typing style props, use `StyleProp<T>` type where `T` is the type of styles related to the component your prop is going to apply.

- If your style prop is going to be applied to a `View`, use `StyleProps<ViewStyle>`.
- If your style prop is going to be applied to a `Text`, use `StyleProps<TextStyle>`.
- If your style prop is going to be applied to a `Image`, use `StyleProps<ImageStyle>`.

```ts
// Before
const propTypes = {
    containerStyle: PropTypes.arrayOf(PropTypes.object),
    textStyle: PropTypes.arrayOf(PropTypes.object),
    imageStyle: PropTypes.arrayOf(PropTypes.object),
};

// After
import {StyleProp, ViewStyle, TextStyle, ImageStyle} from 'react-native'

type Props = {
    containerStyle: StyleProp<ViewStyle>;
    textStyle: StyleProp<TextStyle>;

    // If the styling is optional, mark the prop as optional too.
    imageStyle?: StyleProp<ImageStyle>;
};
```

### Animated styles

If you need to pass style props to an Animated component, use `Animated.WithAnimatedValue<T>` to augment and add support for animated values in your prop.

```tsx
import {useRef} from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';

type Props = {
    style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};

function Component({ style }: Props) {
    return <Animated.View style={style} />;
}

function App() {
    const anim = useRef(new Animated.Value(0)).current;
    return <Component style={{opacity: anim.interpolate({...})}} />;
}
```

### Refs

Use `React.forwardRef` to pass refs between parent and child components. Utilize `React.forwardRef` generic parameters to provide types. The first parameter specifies the **ref's element type** - common components such as `View`, `TextInput` and `Text`. The second parameter is the **props type of the wrapped component**.

```tsx
const ChildComponent = React.forwardRef<View, ViewProps>((props, ref) => (
    <View {...props} ref={ref}>
        <Text>Component</Text>
    </View>
));

function ParentComponent() {
  const viewRef = React.useRef<View>(null);

  return (
    <View>
      <ChildComponent ref={viewRef} {...someViewProps} />
    </View>
  );
};
```

### Children and render props

To type children props, use `React.ReactNode`.

```tsx
type Props = {
    children?: React.ReactNode;
};

function Component({ children }: Props) {
    return children;
}

function App() {
    return (
        <Component>
            <View />
        </Component>
    );
}
```

To type render props, use `() => React.ReactNode`.

```tsx
type Props = {
    children: (label: string) => React.ReactNode;
};

function Component({ children }: Props) {
    return children('Component label');
}

function App() {
    return <Component>{(label) => <View />}</Component>;
}
```
