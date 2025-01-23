import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** */
type HybridAppDelegateAccessData = {
    /** */
    isDelegateAccess?: boolean;

    /** */
    oldDotCurrentUserEmail?: string;

    /** */
    oldDotCurrentAuthToken?: string;

    /** */
    oldDotCurrentEncryptedAuthToken?: string;

    /** */
    oldDotCurrentAccountID?: number;
};

/**  */
type HybridApp = {
    /** Stores the information if HybridApp uses NewDot's sign-in flow */
    useNewDotSignInPage?: boolean;

    /** Tells if we can show AuthScreens */
    readyToShowAuthScreens?: boolean;

    /** States whether we transitioned from OldDot to show only certain group of screens */
    isSingleNewDotEntry?: boolean;

    /** Stores information if last log out was performed from OldDot */
    loggedOutFromOldDot?: boolean;

    /** */
    shouldRemoveDelegatedAccess?: boolean;

    /** Describes current stage of NewDot sign-in */
    newDotSignInState?: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>;

    /**  */
    delegateAccessData?: HybridAppDelegateAccessData;
};

export default HybridApp;
