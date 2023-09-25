# Expensify TypeScript React Native CheatSheet

## Table of Contents

- [CheatSheet](#cheatsheet)
  - [1.1 `props.children`](#children-prop)
  - [1.2 `forwardRef`](#forwardRef)
  - [1.3 Style Props](#style-props)
  - [1.4 Animated styles](#animated-style)
  - [1.5 Render Prop](#render-prop)
  - [1.6 Type Narrowing](#type-narrowing)
  - [1.7 Errors in Try-Catch Clauses](#try-catch-clauses)
  - [1.8 Const Assertion](#const-assertion)
  - [1.9 Higher Order Components](#higher-order-components)
  - [1.10 Function Overloading](#function-overloading)

## CheatSheet

<a name="children-prop"></a><a name="1.1"></a>

- [1.1](#children-prop) **`props.children`**

  ```tsx
  type WrapperComponentProps = {
    children?: React.ReactNode;
  };

  function WrapperComponent({ children }: WrapperComponentProps) {
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
  // CustomTextInput.tsx

  import { forwardRef, useRef, ReactNode, ForwardedRef } from "react";
  import { TextInput, View } from "react-native";

  export type CustomTextInputProps = {
    label: string;
    children?: ReactNode;
  };

  function CustomTextInput(props: CustomTextInputProps, ref: ForwardedRef<TextInput>) {
    return (
      <View>
        <TextInput ref={ref} />
        {props.children}
      </View>
    );
  };

  export default forwardRef(CustomTextInput);

  // ParentComponent.tsx

  function ParentComponent() {
    const ref = useRef<TextInput>();
    return <CustomTextInput ref={ref} label="Press me" />;
  }
  ```

<a name="style-props"></a><a name="1.3"></a>

- [1.3](#style-props) **Style Props**

  Use `StyleProp<T>` to type style props. For pass-through style props, use types exported from `react-native` for the type parameter (e.g. `ViewStyle`).

  ```tsx
  import { StyleProp, ViewStyle, TextStyle, ImageStyle } from "react-native";

  type MyComponentProps = {
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    imageStyle?: StyleProp<ImageStyle>;
  };

  function MyComponent({ containerStyle, textStyle, imageStyle }: MyComponentProps) = {
    <View style={containerStyle}>
        <Text style={textStyle}>Sample Image</Text>
        <Image style={imageStyle} src={'https://sample.com/image.png'} />
    </View>
  }
  ```

<a name="animated-style"></a><a name="1.4"></a>

- [1.4](#animated-style) **Animated styles**

  ```ts
  import {useRef} from 'react';
  import {Animated, StyleProp, ViewStyle} from 'react-native';

  type MyComponentProps = {
      style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  };

  function MyComponent({ style }: MyComponentProps) {
      return <Animated.View style={style} />;
  }

  function App() {
      const anim = useRef(new Animated.Value(0)).current;
      return <MyComponent style={{opacity: anim.interpolate({...})}} />;
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

- [1.6](#type-narrowing) **Type Narrowing** Narrow types down using `typeof`, discriminated unions, or custom type guards. Refer to [this guide](https://medium.com/@hayata.suenaga/discriminated-unions-custom-type-guards-182ebe1f92fb) for more information on when to use discriminated unions and custom type guards.

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

  Errors in try/catch clauses are inferred as `unknown`. If the error data needs to be accessed, the type of the error needs to be checked and narrowed down.

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

- [1.8](#const-assertion) **Use const assertions for rigorous typing**

  Use `as const` when you want to ensure that the types and values are as exact as possible and prevent unwanted mutations.

  ```ts
  const greeting1 = "hello"; // type: string
  const greeting2 = "goodbye" as const; // type: "goodbye"

  const person1 = { name: "Alice", age: 20 }; // type: { name: string, age: number }
  const person2 = { name: "Bob", age: 30 } as const; // type: { readonly name: "Bob", readonly age: 30 }

  const array1 = ["hello", 1]; // type: (string | number)[]
  const array2 = ["goodbye", 2] as const; // type: readonly ["goodbye", 2]
  ```

<a name="higher-order-components"></a><a name="1.9"></a>

- [1.9](#higher-order-components) **Higher Order Components**

  Typing HOCs is hard. Refer to [this article](https://medium.com/@hayata.suenaga/ts-higher-order-components-30c38dd19ae8) for detailed guideline on typing HOCs for different usages of HOCs.

<a name="function-overloading"></a><a name="1.10"></a>

- [1.10](#function-overloading) **Function Overloading**

  Use [function overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) to provide more type information for functions. For the following types of functions, function overloading can be beneficial.

  - The return type depends on the input type
  - When function accepts different number of parameters
  - There are type dependencies between parameters

  Refer to [this guide](https://medium.com/@hayata.suenaga/when-to-use-function-overloads-acc48f7e3142) to learn how to use functional overloads for each situation.
