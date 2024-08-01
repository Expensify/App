import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {AutoAuthState} from '@src/types/onyx/Session';

function desktopLoginRedirect(autoAuthState: AutoAuthState, isSignedIn: boolean) {
    // NOT_STARTED - covers edge case of autoAuthState not being initialized yet (after logout)
    // JUST_SIGNED_IN - confirms passing the magic code step -> we're either logged-in or shown 2FA screen
    // !isSignedIn - confirms we're not signed-in yet as there's possible one last step (2FA validation)
    const shouldPopToTop = (autoAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED || autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN) && !isSignedIn;

    if (shouldPopToTop) {
        Navigation.isNavigationReady().then(() => Navigation.resetToHome());
    }
}

export default desktopLoginRedirect;
