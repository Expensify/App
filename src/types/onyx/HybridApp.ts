/** Data structure holding user's OldDot access information */
type HybridAppDelegateAccessData = {
    /** Indicates if OldDot is accessed in a delegate mode */
    isDelegateAccess?: boolean;

    /** Email address through which the user is currently authenticated in OldDot */
    oldDotCurrentUserEmail?: string;

    /** Authentication token used in OldDot */
    oldDotCurrentAuthToken?: string;

    /** Encrypted authentication token used in OldDot */
    oldDotCurrentEncryptedAuthToken?: string;

    /** Account ID for the user in OldDot */
    oldDotCurrentAccountID?: number;
};

/**  State and configuration of a HybridApp */
type HybridApp = {
    /** Stores the information if HybridApp uses NewDot's sign-in flow */
    useNewDotSignInPage?: boolean;

    /** Determines if the AuthScreens are ready to be displayed */
    readyToShowAuthScreens?: boolean;

    /** Specifies if the transition from OldDot was made to display a specific subset of screens in NewDot */
    isSingleNewDotEntry?: boolean;

    /** Indicates if the last sign out action was performed from OldDot */
    loggedOutFromOldDot?: boolean;

    /** Determines whether to remove delegated access */
    shouldRemoveDelegatedAccess?: boolean;

    /** Holds delegate access information */
    delegateAccessData?: HybridAppDelegateAccessData;

    /** Indicates if NewDot is being closed */
    closingReactNativeApp?: boolean;
};

export default HybridApp;
