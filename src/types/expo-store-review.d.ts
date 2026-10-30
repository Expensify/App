declare module 'expo-store-review' {
    function hasAction(): Promise<boolean>;
    function isAvailableAsync(): Promise<boolean>;
    function requestReview(): Promise<void>;

    export {hasAction, isAvailableAsync, requestReview};
}
