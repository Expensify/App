import {StackActions} from '@react-navigation/native';
import resetOnboardingStackToRoot from '@libs/Navigation/helpers/resetOnboardingStackToRoot';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/resetOnboardingStackToRoot', () => jest.requireActual('@libs/Navigation/helpers/resetOnboardingStackToRoot/index.ts'));

jest.mock('@libs/Navigation/navigationRef', () => ({
    isReady: jest.fn(),
    getRootState: jest.fn(),
    dispatch: jest.fn(),
}));

describe('resetOnboardingStackToRoot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not dispatch when navigation is not ready', () => {
        jest.mocked(navigationRef.isReady).mockReturnValue(false);

        resetOnboardingStackToRoot();

        expect(navigationRef.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when onboarding modal is not mounted', () => {
        jest.mocked(navigationRef.isReady).mockReturnValue(true);
        jest.mocked(navigationRef.getRootState).mockReturnValue({
            index: 0,
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, key: 'tab-key'}],
        } as ReturnType<typeof navigationRef.getRootState>);

        resetOnboardingStackToRoot();

        expect(navigationRef.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when onboarding stack has only one route', () => {
        jest.mocked(navigationRef.isReady).mockReturnValue(true);
        jest.mocked(navigationRef.getRootState).mockReturnValue({
            index: 1,
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
        } as ReturnType<typeof navigationRef.getRootState>);

        resetOnboardingStackToRoot();

        expect(navigationRef.dispatch).not.toHaveBeenCalled();
    });

    it('should pop nested onboarding routes back to the first step', () => {
        jest.mocked(navigationRef.isReady).mockReturnValue(true);
        jest.mocked(navigationRef.getRootState).mockReturnValue({
            index: 1,
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
        } as ReturnType<typeof navigationRef.getRootState>);

        resetOnboardingStackToRoot();

        expect(navigationRef.dispatch).toHaveBeenCalledWith({
            ...StackActions.pop(2),
            target: 'nested-key',
        });
    });
});
