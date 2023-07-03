# Expensify TypeScript React Native CheatSheet

## Table of Contents

- [1.1 `props.children`](#children-prop)
- [1.2 `forwardRef`](#forwardRef)
- [1.3 Animated styles](#animated-style)
- [1.4 Style Props](#style-props)
- [1.5 Render Prop](#render-prop)
- [1.6 Type Narrowing](#type-narrowing)
- [1.7 Errors in Try-Catch Clauses](#try-catch-clauses)
- [1.8 Const Assertion](#const-assertion)

## CheatSheet

<a name="children-prop"></a><a name="1.1"></a>

- [1.1](#children-prop) **`props.children`**

  ```tsx
  type WrapperComponentProps = {
    children?: React.ReactNode;
  };

  function WrapperComponent({ children }: Props) {
    return <View>{children}</View>;
  }

  function App() {
    return (
      <WrapperComponent>
        <View />
      </WrapperComponent>
    );
  }
  ```

<a name="forwardRef"></a><a name="1.2"></a>

- [1.2](#forwardRef) **`forwardRef`**

  ```ts
  import { forwardRef, useRef, ReactNode } from "react";
  import { TextInput, View } from "react-native";

  export type CustomButtonProps = {
    label: string;
    children?: ReactNode;
  };

  const CustomTextInput = forwardRef<TextInput, CustomButtonProps>(
    (props, ref) => {
      return (
        <View>
          <TextInput ref={ref} />
          {props.children}
        </View>
      );
    }
  );

  function ParentComponent() {
    const ref = useRef<TextInput>;
    return <CustomTextInput ref={ref} label="Press me" />;
  }
  ```

<a name="animated-style"></a><a name="1.3"></a>

- [1.3](#animated-style) **Animated styles**

  ```ts
  import {useRef} from 'react';
  import {Animated, StyleProp, ViewStyle} from 'react-native';

  type MyComponentProps = {
      style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  };

  function MyComponent({ style }: Props) {
      return <Animated.View style={style} />;
  }

  function MyComponent() {
      const anim = useRef(new Animated.Value(0)).current;
      return <Component style={{opacity: anim.interpolate({...})}} />;
  }
  ```

<a name="style-props"></a><a name="1.4"></a>

- [1.4](#style-props) **Style Props**

  Use `StyleProp<T>` to type style props. For pass-through style props, use types exported from `react-native` for the type parameter (e.g. `ViewStyle`).

  ```tsx
  import { StyleProp, ViewStyle, TextStyle, ImageStyle } from "react-native";

  type MyComponentProps = {
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    imageStyle?: StyleProp<ImageStyle>;
  };

  function MyComponentProps({ containerStyle, textStyle, imageStyle }: MyComponentProps) = {
    <View style={containerStyle}>
        <Text style={textStyle}>Sample Image</Text>
        <Image style={imageStyle} src={'https://sample.com/image.png'} />
    </View>
  }
  ```

<a name="render-prop"></a><a name="1.5"></a>

- [1.5](#render-prop) **Render Prop**

  ```tsx
  type ParentComponentProps = {
    children: (label: string) => React.ReactNode;
  };

  function ParentComponent({ children }: ParentComponentProps) {
    return children("String being injected");
  }

  function App() {
    return (
      <ParentComponent>
        {(label) => (
          <View>
            <Text>{label}</Text>
          </View>
        )}
      </ParentComponent>
    );
  }
  ```

<a name="type-narrowing"></a><a name="1.6"></a>

- [1.6](#type-narrowing) **Type Narrowing** Narrow types down using `typeof` or custom type guards.

  ```ts
  type Manager = {
    role: "manager";
    team: string;
  };

  type Engineer = {
    role: "engineer";
    language: "ts" | "js" | "php";
  };

  function introduce(employee: Manager | Engineer) {
    console.log(employee.team); // TypeScript errors: Property 'team' does not exist on type 'Manager | Engineer'.

    if (employee.role === "manager") {
      console.log(`I manage ${employee.team}`); // employee: Manager
    } else {
      console.log(`I write ${employee.language}`); // employee: Engineer
    }
  }
  ```

  In the above code, type narrowing is used to determine whether an employee object is a Manager or an Engineer based on the role property, allowing safe access to the `team` property for managers and the `language` property for engineers.

  We can also create a custom type guard function.

  ```ts
  function isManager(employee: Manager | Engineer): employee is Manager {
    return employee.role === "manager";
  }

  function introduce(employee: Manager | Engineer) {
    if (isManager(employee)) {
      console.log(`I manage ${employee.team}`); // employee: Manager
    }
  }
  ```

  In the above code, `employee is Manager` is a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates). It means that the return type of `isManager` is a `boolean` that indicates whether a value passed to the function is of a certain type (e.g. `Manager`).

<a name="try-catch-clauses"></a><a name="1.7"></a>

- [1.7](#try-catch-clauses) **Error in Try-Catch Clauses**

  Errors in try/catch clauses are inferred as `unknown`. If the error dat needs to be accessed, the type of the error needs to be checked and narrowed down.

  ```ts
  try {
      ....
  } catch (e) { // `e` is `unknown`.
      if (e instanceof Error) {
          // you can access properties on Error
          console.error(e.message);
      }
  }
  ```

<a name="const-assertion"></a><a name="1.8"></a>

- [1.8](#const-assersion) **Use const assertions for rigorous typing**

  Use `as const` when you want to ensure that the types and values are as exact as possible and prevent unwanted mutations.

  ```ts
  const greeting1 = "hello"; // type: string
  const greeting2 = "goodbye" as const; // type: "goodbye"

  const person1 = { name: "Alice", age: 20 }; // type: { name: string, age: number }
  const person2 = { name: "Bob", age: 30 } as const; // type: { readonly name: "Bob", readonly age; 30 }

  const array1 = ["hello", 1]; // type: (string | number)[]
  const array2 = ["goodbye", 2]; // type: readonly ["goodbye", 2]
  ```
