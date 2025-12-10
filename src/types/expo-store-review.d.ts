declare module 'expo-store-review' {
    const hasAction: (() => boolean) | undefined;
    function isAvailableAsync(): Promise<boolean>;
    function requestReview(): Promise<void>;

    export {hasAction, isAvailableAsync, requestReview};
}
