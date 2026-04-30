// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameter kept for API parity with the iOS implementation (index.ios.ts)
function continuePlaidOAuth(_url: string): void {
    // Plaid OAuth return is handled only on iOS HybridApp (see issue #87757).
}

export default continuePlaidOAuth;
