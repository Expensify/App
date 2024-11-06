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
};

export default HybridApp;
