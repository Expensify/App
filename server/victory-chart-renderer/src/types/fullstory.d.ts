// Activates the JSX attribute augmentation from @fullstory/react-native so that `fsClass` and
// sibling attributes are recognized on all React Native elements compiled in this project.
// This mirrors the `declare module 'react'` block inside
// @fullstory/react-native/lib/typescript/fullstoryInterface.d.ts but avoids importing the full
// Fullstory package, which would cascade into unrelated parts of the main app.

// The top-level export makes this a module file so `declare module 'react'` is treated as an
// augmentation of the react module rather than a full replacement.
export {};

declare module 'react' {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface IntrinsicAttributes {
            fsClass?: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fsAttribute?: Record<string, any>;
            fsTagName?: string;
        }
    }
}
