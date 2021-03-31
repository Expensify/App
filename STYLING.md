# React Native Styling Guidelines

## Where to Define Styles

All styles must be defined in the `styles.js` file which exists as a globally exported stylesheet of sorts for the application. Unlike some React Native applications we are not using `StyleSheet.create()` and instead store styles as plain JS objects. There are many helper styles available for direct use in components and can be found in the `/styles` directory.

## When to Create a New Style

If we need some minimal set of styling rules applied to a component then it's almost always better to use an array of helper styles rather than create an entirely new style if it will only be used once. Resist the urge to create a new style for any new element added to a screen. There is a very good chance the style we are adding is a "single-use" style.

```jsx
// Bad - Since we only use this style once in this component
const TextWithPadding = props => (
    <Text style={styles.textWithPadding}>
        {props.children}
    </Text>
);

// Good
const TextWithPadding = props => (
    <Text
        style={[
            styles.p5,
            styles.noWrap,
        ]}
    >
        {props.children}
    </Text>
);
```

On the other hand, if we are copying and pasting some chunks of JSX from one place to another then that might be a sign that we need either a new component or a new reusable style.

## Use the "Rule of Three"

Any array of styles associated with a single type of component or element that has at least 3 identical usages should be refactored into either:

- A new component with that same array of helper styles

- A new style that is a composite of all helper styles

## Inline Styles

**Inline styles are forbidden.** If we run into a case where we feel it's necessary to conditionally render some styles. There are two options:

1. Create a helper function in `styles.js` and pass any modifying parameters to that function.
1. Conditionally render a style object inline by defaulting to `undefined`.

```jsx
// Bad - Do not use inline styles
const TextWithPadding = props => (
    <Text style={{
        padding: 10,
        whiteSpace: props.shouldWrap ? 'wrap' : 'nowrap',
    }}>
        {props.children}
    </Text>
);

// Good
const TextWithPadding = props => (
    <Text
        style={[
            styles.p5,
            props.shouldWrap ? undefined : styles.noWrap,
        ]}
    >
        {props.children}
    </Text>
);

// Good
const TextWithPadding = props => (
    <Text
        style={[
            styles.p5,
            getTextWrapStyle(props.shouldWrap)
        ]}
    >
        {props.children}
    </Text>
);
```

## Don't Go Style Fishing

There are many styles in the `styles.js` file. It is generally a bad practice to grab style meant for a specific use case and utilize it for some other use case without changing it's name to make it more general. If we think we see a style that might be appropriate for reuse, but does not have a generic name then we should rename it instead of using it directly.

```jsx
// Bad - Reuses style without generalizing style name
const SettingsScreen = props => (
    <View>
        <Text style={[styles.settingsScreenText]}>
            Expensify
        </Text>
    </View>
);

const SomeOtherScreen = props => (
    <View>
        <Text style={[styles.settingsScreenText]}>
            Expensify.cash
        </Text>
    </View>
);

// Good
const SettingsScreen = props => (
    <View>
        <Text style={[styles.defaultScreenText]}>
            Expensify
        </Text>
    </View>
);

const SomeOtherScreen = props => (
    <View>
        <Text style={[styles.defaultScreenText]}>
            Expensify.cash
        </Text>
    </View>
);
```

## When and How to Pass Styles via Props

In some cases, we may want a more complex component to allow a parent to modify a style of one of it's child elements. In other cases, we may have a very simple component that has one child which has a `style` prop. Let's look at how to handle these two examples.

### Complex Component

Always pass style props with clear names that describe which child element style will be modified. Specific styles should clearly indicate what the expected type is by using a singular (`Object`) or plural (`Array`) naming convention.

```jsx
// Bad - props.style should not be used in complex components
const SettingsScreen = props => (
    <View>
        <Header
            style={[
                styles.defaultHeader,
                props.style,
            ]}
        />
        <Body style={props.bodyStyles} />
        ...
    </View>
);

// Bad - style with a flexible type requires extra handling
const SettingsScreen = props => {
    const extraHeaderStyles = _.isArray(props.headerStyle)
        ? props.headerStyle
        : [props.headerStyle];
    return (
        <View>
            <Header
                style={[
                    styles.defaultHeader,
                    ...extraHeaderStyles,
                ]}
            />
            <Body style={[props.bodyStyle]} />
            ...
        </View>
    );
}

// Good - Uses a singular and passes a single style object
const SettingsScreen = props => (
    <View>
        <Header
            style={[
                styles.defaultHeader,
                props.headerStyle,
            ]}
        />
        ...
    </View>
);

// Good - Uses a plural and passes an array of style objects with spread syntax
const SettingsScreen = props => (
    <View>
        <Header
            style={[
                styles.defaultHeader,
                ...props.headerStyles,
            ]}
        />
        ...
    </View>
);
```

### Simple Component

The only time we should allow a component to have a `style` prop with `PropTypes.any` is when we are wrapping a single child that has a flexible `style` type that accepts both `Array` or `Object` types.

```jsx
// Good
const CustomText = props => (
    <Text style={props.style}>{props.children}</Text>
);

// Good
const CustomText = props => {
        const propsStyle = _.isArray(props.style)
            ? props.style
            : [props.style];
}(
    <Text
        style={[
            styles.defaultCustomText,
            ...propsStyle,
        ]}
    >
        {props.children}
    </Text>
);
```

In that last example, there is just one simple element and no ambiguity about what `props.style` refers to. The component is used in many places and has some default styles therefore we must add custom style handling behavior.