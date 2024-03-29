declare module '@vue/preload-webpack-plugin' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Options {
        rel: string;
        as: string;
        fileWhitelist: RegExp[];
        include: string;
    }

    declare class PreloadWebpackPlugin {
        constructor(options?: Options);
        apply(compiler: Compiler): void;
    }

    export default PreloadWebpackPlugin;
}
