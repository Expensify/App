import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Creates a navigation state structure for displaying the verify account screen as a modal overlay.
 * This function generates a state that opens the verify account screen within
 * the RIGHT_MODAL_NAVIGATOR -> SETTINGS modal hierarchy, ensuring it displays as an overlay
 * over the current screen.
 * In future, this function may be expanded to handle other modal routes similarly.
 */
function getStateForVerifyAccountRoute(path: string) {
    return {
        routes: [
            {
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    routes: [
                        {
                            name: SCREENS.RIGHT_MODAL.SETTINGS,
                            state: {
                                routes: [
                                    {
                                        name: SCREENS.SETTINGS.VERIFY_ACCOUNT,
                                        path,
                                    },
                                ],
                                index: 0,
                            },
                        },
                    ],
                    index: 0,
                },
            },
        ],
    };
}

export default getStateForVerifyAccountRoute;
