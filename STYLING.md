# React Native Styling Guidelines

## Where to Define Styles

All styles must be defined in the `/styles` directory and `styles.js` contains the final export after gathering all appropriate styles. Unlike some React Native applications we are not using `StyleSheet.create()` and instead store styles as plain JS objects. There are also many helper styles available for direct use in components.

These helper styles are loosely based on the [Bootstrap system of CSS utility helper classes](https://getbootstrap.com/docs/5.0/utilities/spacing/) and are typically incremented by units of `4`.

**Note:** Not all helpers from Bootstrap exist, so it may be necessary to create the helper style we need.

## When to Create a New Style

If we need some minimal set of styling rules applied to a single-use component then it's almost always better to use an array of helper styles rather than create an entirely new style if it will only be used once. Resist the urge to create a new style for every new element added to a screen. There is a very good chance the style we are adding is a "single-use" style.

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

On the other hand, if we are copying and pasting some chunks of JSX from one place to another then that might be a sign that we need a new reusable style.

## Use the "Rule of Three"

In order to resist the urge to preoptimize and have many single-use components we've adopted a main principle:

Any array of styles associated with a single type of React element that has at least 3 identical usages should be refactored into:

- A new resusable style that can be used in many places e.g. `styles.button`
- If that style has modifiers or style variations then those styles should follow a naming convention of `styles.elementModifer` e.g. `styles.buttonSuccess`
- If a reusable style has 3 or more modifiers it should be refactored into a component with props to modify the styles e.g.

```jsx
<Button title="Submit" success large />
```

## Inline Styles

**Inline styles are forbidden.** If we run into a case where we feel it's necessary to conditionally render some styles we should create a helper function then pass any modifying parameters to that function. Small helper functions can be written directly in `styles.js`, but larger, more complex methods should be put in their own modules and imported into `styles.js`.

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
            getTextWrapStyle(props.shouldWrap)
        ]}
    >
        {props.children}
    </Text>
);
```

## How to Reuse Styles

There are many styles in the `styles.js` file. It is generally a bad practice to grab a style meant for a _specific_ use case and utilize it for some other more _general_ use case without changing it's name to make it more general. If we think we see a style that might be appropriate for reuse, but does not have a generic name then we should **rename it** instead of using it directly.

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
            New Expensify
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
            New Expensify
        </Text>
    </View>
);
```

## When and How to Pass Styles via Props

In some cases, we may want a more complex component to allow a parent to modify a style of one of it's child elements. In other cases, we may have a very simple component that has one child which has a `style` prop. Let's look at how to handle these two examples.

### Complex Component

Always pass style props with a name that describes which child element styles will be modified. All style props should accept an `Array` of style `Object` and have a pluralized name e.g. `headerStyles`

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

// Bad - Uses a singular and passes a single style object
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
