declare module '*.png' {
    import type {ImageSourcePropType} from 'react-native';

    const value: ImageSourcePropType;
    export default value;
}

declare module '*.jpg' {
    import type {ImageSourcePropType} from 'react-native';

    const value: ImageSourcePropType;
    export default value;
}

declare module '*.svg' {
    import type React from 'react';
    import type {SvgProps} from 'react-native-svg';

    const content: React.FC<SvgProps>;
    export default content;
}

declare module '*.lottie' {
    import type {LottieViewProps} from 'lottie-react-native';

    const value: LottieViewProps['source'];
    export default value;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
    setSupportToken: (token: string, email: string, accountID: number) => void;
}

// Allows to add generic type in require
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface NodeRequire {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/no-explicit-any
    <T = any>(id: string): T;
}

// Metro module factory — the function signature Metro passes to __d
type MetroModuleFactory = (...args: unknown[]) => void;

// Metro's module-define function injected into the global scope by the runtime
type MetroDefine = (factory: MetroModuleFactory, moduleId: number, deps: number[], moduleName?: string) => void;

// Typed view of the Metro/Hermes globals accessed by moduleInitPolyfill.ts.
// String-literal keys are used intentionally to match Metro's __double_underscore
// naming convention without triggering the naming-convention ESLint rule.
type MetroRuntime = {
    ['__d']: MetroDefine | undefined;
    ['__moduleDefCount']: number;
    ['__moduleInitTimes']: Record<number, number>;
    ['__moduleNames']: Record<number, string>;
    // Hermes high-resolution clock, undefined in non-Hermes environments
    nativePerformanceNow: (() => number) | undefined;
};

// Standalone declarations so these globals are also accessible without `global.` prefix
// eslint-disable-next-line no-var, no-underscore-dangle, @typescript-eslint/naming-convention
declare var __moduleInitTimes: Record<number | string, number> | undefined;
// eslint-disable-next-line no-var, no-underscore-dangle, @typescript-eslint/naming-convention
declare var __moduleNames: Record<number, string> | undefined;

// Define ArrayBuffer.transfer as its a relatively new API and not yet present in all environments
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ArrayBuffer {
    // Might be defined in browsers, in RN hermes it's not implemented yet
    transfer?: (length: number) => ArrayBuffer;
}
