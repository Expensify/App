# Expensify PropTypes Conversation Table

## Table of Contents

- [Important Considerations](#important-considerations)
  - [Don't Rely on `isRequired`](#dont-rely-on-isrequired)
- [PropTypes Conversion Table](#proptypes-conversion-table)
- [Conversion Example](#conversion-example)

## Important Considerations

### Don't Rely on `isRequired`

Regardless of `isRequired` is present or not on props in `PropTypes`, read through the component implementation to check if props without `isRequired` can actually be optional. The use of `isRequired` is not consistent in the current codebase. Just because `isRequired` is not present, it does not necessarily mean that the prop is optional.

One trick is to mark the prop in question with optional modifier `?`. See if the "possibly `undefined`" error is raised by TypeScript. If any error is raised, the implementation assumes the prop not to be optional.

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
  confirmText: string; // vs. confirmText?: string;
};
```

## PropTypes Conversion Table

| PropTypes                                                            | TypeScript                                    | Instructions                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PropTypes.any`                                                      | `T`, `Record<string, unknown>` or `any`       | Figure out what would be the correct data type and use it.<br><br>If you know that it's a object but isn't possible to determine the internal structure, use `Record<string, unknown>`.                                                       |
| `PropTypes.array` or `PropTypes.arrayOf(T)`                          | `T[]` or `Array<T>`                           | Convert to `T[]` or `Array<T>`, where `T` is the data type of the array.<br><br>If `T` isn't a primitive type, create a separate `type` for the object structure of your prop and use it.                                                     |
| `PropTypes.bool`                                                     | `boolean`                                     | Convert to `boolean`.                                                                                                                                                                                                                         |
| `PropTypes.func`                                                     | `(arg1: Type1, arg2, Type2...) => ReturnType` | Convert to the function signature.                                                                                                                                                                                                            |
| `PropTypes.number`                                                   | `number`                                      | Convert to `number`.                                                                                                                                                                                                                          |
| `PropTypes.object`, `PropTypes.shape(T)` or `PropTypes.exact(T)`     | `T`                                           | If `T` isn't a primitive type, create a separate `type` for the `T` object structure of your prop and use it.<br><br>If you want an object but isn't possible to determine the internal structure, use `Record<string, unknown>`.             |
| `PropTypes.objectOf(T)`                                              | `Record<string, T>`                           | Convert to a `Record<string, T>` where `T` is the data type of your dictionary.<br><br>If `T` isn't a primitive type, create a separate `type` for the object structure and use it.                                                           |
| `PropTypes.string`                                                   | `string`                                      | Convert to `string`.                                                                                                                                                                                                                          |
| `PropTypes.node`                                                     | `React.ReactNode`                             | Convert to `React.ReactNode`. `ReactNode` includes `ReactElement` as well as other types such as `strings`, `numbers`, `arrays` of the same, `null`, and `undefined` In other words, anything that can be rendered in React is a `ReactNode`. |
| `PropTypes.element`                                                  | `React.ReactElement`                          | Convert to `React.ReactElement`.                                                                                                                                                                                                              |
| `PropTypes.symbol`                                                   | `symbol`                                      | Convert to `symbol`.                                                                                                                                                                                                                          |
| `PropTypes.elementType`                                              | `React.ElementType`                           | Convert to `React.ElementType`.                                                                                                                                                                                                               |
| `PropTypes.instanceOf(T)`                                            | `T`                                           | Convert to `T`.                                                                                                                                                                                                                               |
| `PropTypes.oneOf([T, U, ...])` or `PropTypes.oneOfType([T, U, ...])` | `T \| U \| ...`                               | Convert to a union type e.g. `T \| U \| ...`.                                                                                                                                                                                                 |

## Conversion Example

```ts
// Before
const propTypes = {
  unknownData: PropTypes.any,
  anotherUnknownData: PropTypes.any,
  indexes: PropTypes.arrayOf(PropTypes.number),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  shouldShowIcon: PropTypes.bool,
  onChangeText: PropTypes.func,
  count: PropTypes.number,
  session: PropTypes.shape({
    authToken: PropTypes.string,
    accountID: PropTypes.number,
  }),
  errors: PropTypes.objectOf(PropTypes.string),
  inputs: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  label: PropTypes.string,
  anchor: PropTypes.node,
  footer: PropTypes.element,
  uniqSymbol: PropTypes.symbol,
  icon: PropTypes.elementType,
  date: PropTypes.instanceOf(Date),
  size: PropTypes.oneOf(["small", "medium", "large"]),
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

type Size = "small" | "medium" | "large";

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
