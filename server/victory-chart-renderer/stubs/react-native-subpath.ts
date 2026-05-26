// Catch-all stub for `react-native/Libraries/...` style deep imports that
// `@shopify/react-native-skia` emits at module load (e.g. its native picture
// view spec or asset registry helpers). None of those code paths execute in
// the Bun headless renderer, but their import statements still run, so this
// stub provides a no-op default plus a few of the most common named exports.

const noopFunction = (..._args: unknown[]) => null;

export default noopFunction;
export const codegenNativeComponent = noopFunction;
export const registerAsset = (asset: unknown) => asset;
export const getAssetByID = () => null;
