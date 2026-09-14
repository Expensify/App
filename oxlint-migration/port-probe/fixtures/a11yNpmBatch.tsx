// One violation per react-native-a11y rule, each followed by the valid form its own docs allow.
// The rules read prop names and literal shapes, so nothing here needs the react-native runtime:
// TouchableOpacity, View, Image and Text are matched by name only.
// Handler and array identities matter: isNodePropExpression treats only Identifier, CallExpression,
// ConditionalExpression and MemberExpression as "value we cannot evaluate", so the valid forms below
// pass objects and functions by name.
const actions = [{name: 'activate'}];
const onAccessibilityAction = () => undefined;

// react-native-a11y/has-accessibility-props: accessibilityRole mixed with a deprecated trait
export function HasAccessibilityProps() {
    return (
        <>
            <TouchableOpacity accessibilityRole="button" accessibilityTraits="button" />
            <TouchableOpacity accessibilityLabel="Deprecated pair" accessibilityTraits="button" accessibilityComponentType="button" />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-actions: list without a handler
export function HasValidAccessibilityActions() {
    return (
        <>
            <View accessibilityActions={[{name: 'activate'}]} />
            <View accessibilityActions={actions} onAccessibilityAction={onAccessibilityAction} />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-component-type: value outside the enum
export function HasValidAccessibilityComponentType() {
    return (
        <>
            <View accessibilityComponentType="switch" />
            <View accessibilityComponentType="button" />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-ignores-invert-colors: invertable Image without the prop
export function HasValidAccessibilityIgnoresInvertColors() {
    return (
        <>
            <Image source={{uri: 'https://example.com/inverted.png'}} />
            <Image accessibilityIgnoresInvertColors source={{uri: 'https://example.com/ignored.png'}} />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-live-region: value outside the enum
export function HasValidAccessibilityLiveRegion() {
    return (
        <>
            <View accessibilityLiveRegion="eager" />
            <View accessibilityLiveRegion="assertive" />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-role: value outside the enum
export function HasValidAccessibilityRole() {
    return (
        <>
            <View accessibilityRole="dialog" />
            <View accessibilityRole="imagebutton" />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-state: object key with a non-boolean literal
export function HasValidAccessibilityState() {
    return (
        <>
            <View accessibilityState={{disabled: 'nope'}} />
            <View accessibilityState={{disabled: true, selected: false}} />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-states: array member outside the enum
export function HasValidAccessibilityStates() {
    return (
        <>
            <View accessibilityStates={['focused']} />
            <View accessibilityStates={['selected', 'disabled']} />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-traits: value outside the enum
export function HasValidAccessibilityTraits() {
    return (
        <>
            <View accessibilityTraits="focused" />
            <View accessibilityTraits="header" />
        </>
    );
}

// react-native-a11y/has-valid-accessibility-value: numeric field holding a string
export function HasValidAccessibilityValue() {
    return (
        <>
            <View accessibilityValue={{min: 0, max: 10, now: 'five'}} />
            <View accessibilityValue={{min: 0, max: 10, now: 5}} />
        </>
    );
}

// react-native-a11y/has-valid-important-for-accessibility: value outside the enum
export function HasValidImportantForAccessibility() {
    return (
        <>
            <View importantForAccessibility="maybe" />
            <View importantForAccessibility="no-hide-descendants" />
        </>
    );
}

// react-native-a11y/no-nested-touchables: touchable inside accessible={true}
export function NoNestedTouchables() {
    return (
        <>
            <View accessible={true}>
                <TouchableOpacity accessibilityLabel="Nested" onPress={() => undefined} />
            </View>
            <View accessible={true}>
                <Text>Not clickable</Text>
            </View>
        </>
    );
}
