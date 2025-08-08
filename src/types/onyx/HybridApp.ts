/**  State and configuration of a HybridApp */
type HybridApp = {
    /** Specifies if the transition from OldDot was made to display a specific subset of screens in NewDot */
    isSingleNewDotEntry?: boolean;

    /** Indicates if NewDot is being closed */
    closingReactNativeApp?: boolean;
};

export default HybridApp;
