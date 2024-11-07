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

    /** stores infromation if last log out was performed from OldDot */
    loggedOutFromOldDot?: boolean;
};

export default HybridApp;
