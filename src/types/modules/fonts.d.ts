/** Font assets are Metro registry IDs on native and emitted URLs or data URLs on web. */
declare module '*.otf' {
    const asset: number | string;
    export default asset;
}

declare module '*.ttf' {
    const asset: number | string;
    export default asset;
}

// WOFF2 assets are emitted as URL strings by the web bundler.
declare module '*.woff2' {
    const asset: string;
    export default asset;
}
