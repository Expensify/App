import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

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
