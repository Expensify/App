import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**  */
type HybridApp = {
    /** Stores the information if HybridApp uses NewDot's sign-in flow */
    useNewDotSignInPage?: boolean;

    /** Stores the information about error that occurred on OldDot side during sign-in */
    oldDotSignInError?: string | null;

    /** Tells if we can show AuthScreens */
    readyToShowAuthScreens?: boolean;

    /** States whether we transitioned from OldDot to show only certain group of screens */
    isSingleNewDotEntry?: boolean;

    /** stores infromation if last log out was performed from OldDot */
    loggedOutFromOldDot?: boolean;

    /** */
    shouldRemoveDelegatedAccess?: boolean;

    /** Describes current stage of NewDot sign-in */
    newDotSignInState?: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>;

    /** Describes current stage of OldDot sign-in */
    oldDotSignInState?: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>;
};

export default HybridApp;
