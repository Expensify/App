declare module 'react-native/Libraries/Components/View/ReactNativeStyleAttributes' {
    type StyleAttribute = true | {readonly diff?: (a: unknown, b: unknown) => boolean; readonly process?: (value: unknown) => unknown};

    const ReactNativeStyleAttributes: Record<string, StyleAttribute>;

    export default ReactNativeStyleAttributes;
}
