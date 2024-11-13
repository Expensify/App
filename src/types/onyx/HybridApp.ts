/**  */
type HybridApp = {
    /** Stores the information if HybridApp uses NewDot's sign in flow */
    useNewDotSignInPage?: boolean;

    /**  */
    isSigningIn?: boolean;

    /** */
    oldDotSignInError?: string | null;

    /**  */
    readyToShowAuthScreens?: boolean;

    /**  */
    readyToSwitchToClassicExperience?: boolean;

    /** */
    shouldResetSigningInLogic?: boolean;

    /** States whether we transitioned from OldDot to show only certain group of screens. It should be undefined on pure NewDot. */
    isSingleNewDotEntry?: boolean;

    /** stores infromation if last log out was performed from OldDot */
    loggedOutFromOldDot?: boolean;

    /** */
    shouldRemoveDelegatedAccess?: boolean;
};

export default HybridApp;
