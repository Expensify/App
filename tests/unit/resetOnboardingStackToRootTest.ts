import {StackActions} from '@react-navigation/native';
import resetOnboardingStackToRoot from '@libs/Navigation/helpers/resetOnboardingStackToRoot';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/resetOnboardingStackToRoot', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/resetOnboardingStackToRoot/index.ts'),
);

jest.mock('@libs/Navigation/navigationRef', () => ({
    isReady: jest.fn(),
    getRootState: jest.fn(),
    dispatch: jest.fn(),
}));

/* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
const mockedIsReady = jest.mocked(navigationRef.isReady);
const mockedGetRootState = jest.mocked(navigationRef.getRootState);
const mockedDispatch = jest.mocked(navigationRef.dispatch);
/* eslint-enable @typescript-eslint/unbound-method */

describe('resetOnboardingStackToRoot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not dispatch when navigation is not ready', () => {
        mockedIsReady.mockReturnValue(false);

        resetOnboardingStackToRoot();

        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when onboarding modal is not mounted', () => {
        mockedIsReady.mockReturnValue(true);
        mockedGetRootState.mockReturnValue({
            key: 'root-key',
            index: 0,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR],
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, key: 'tab-key'}],
            type: 'stack',
            stale: false,
        });

        resetOnboardingStackToRoot();

        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when onboarding stack has only one route', () => {
        mockedIsReady.mockReturnValue(true);
        mockedGetRootState.mockReturnValue({
            key: 'root-key',
            index: 1,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR],
            routes: [
                {name: NAVIGATORS.TAB_NAVIGATOR, key: 'tab-key'},
                {
                    name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
                    key: 'onboarding-key',
                    state: {
                        key: 'nested-key',
                        index: 0,
                        routes: [{name: SCREENS.ONBOARDING.PURPOSE, key: 'purpose-key'}],
                    },
                },
            ],
            type: 'stack',
            stale: false,
        });

        resetOnboardingStackToRoot();

        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('should pop nested onboarding routes back to the first step', () => {
        mockedIsReady.mockReturnValue(true);
        mockedGetRootState.mockReturnValue({
            key: 'root-key',
            index: 1,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR],
            routes: [
                {name: NAVIGATORS.TAB_NAVIGATOR, key: 'tab-key'},
                {
                    name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
                    key: 'onboarding-key',
                    state: {
                        key: 'nested-key',
                        index: 2,
                        routes: [
                            {name: SCREENS.ONBOARDING.PURPOSE, key: 'purpose-key'},
                            {name: SCREENS.ONBOARDING.PERSONAL_DETAILS, key: 'details-key'},
                            {name: SCREENS.ONBOARDING.INTERESTED_FEATURES, key: 'features-key'},
                        ],
                    },
                },
            ],
            type: 'stack',
            stale: false,
        });

        resetOnboardingStackToRoot();

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...StackActions.pop(2),
            target: 'nested-key',
        });
    });
});
