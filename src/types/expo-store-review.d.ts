declare module 'expo-store-review' {
    // eslint-disable-next-line rulesdir/no-inline-named-export
    export const hasAction: (() => boolean) | undefined;
    function isAvailableAsync(): Promise<boolean>;
    function requestReview(): Promise<void>;

    export {isAvailableAsync, requestReview};
}
