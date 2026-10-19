/** Static font imports need declarations for the values emitted by each platform bundler. */
declare module '*.otf' {
    const asset: number;
    export default asset;
}

// Shared TTF files can become Metro registry IDs or web URLs, depending on the importing platform.
declare module '*.ttf' {
    const asset: number | string;
    export default asset;
}

// WOFF2 assets are emitted as URL strings by the web bundler.
declare module '*.woff2' {
    const asset: string;
    export default asset;
}
