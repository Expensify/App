// Helper module for importNativeBatch: the shapes import/named and import/no-named-as-default-member need
// are a module whose default export carries a property that is ALSO a named export, the react-native-config
// shape production hits. Plain ESM syntax only, so eslint-plugin-import's ExportMap can parse it.

export const sharedConfigValue = 1;

export function helperSum(a: number, b: number): number {
    return a + b;
}

export type HelperOptions = {prefix: string};

export default {sharedConfigValue, helperSum};
