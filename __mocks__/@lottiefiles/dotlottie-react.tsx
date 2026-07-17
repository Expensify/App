/**
 * `@lottiefiles/dotlottie-react` ships as a pure ESM package (`"type": "module"` with no CommonJS build),
 * which Jest's CommonJS runtime cannot load (it throws "Must use import to load ES Module" in CI).
 * It is only used on web to play dotLottie animations and to point the dotlottie-web WASM binary at our CDN,
 * so a lightweight mock is sufficient for the test environment.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setWasmUrl(..._args: unknown[]) {}

// eslint-disable-next-line import/prefer-default-export
export {setWasmUrl};
