/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'react-native-web' {
    class Clipboard {
        static isAvailable(): boolean;
        static getString(): Promise<string>;
        static setString(text: string): boolean;
    }

    export {Clipboard};
}
