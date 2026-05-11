// These are needed because react-native-nitro-fetch references `react-native-nitro-text-decoder` package without actually importing it
// This causes Webpack and therefore Storybook scripts to fail, because it tries to import the package and fails.
const TextDecoder = globalThis.TextDecoder;
const TextEncoder = globalThis.TextEncoder;

export {TextDecoder, TextEncoder};
