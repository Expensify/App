import navigateToDomainSettingsRoute from '@libs/Navigation/helpers/navigateToDomainSettingsRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import createMock from '../utils/createMock';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        setParams: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(),
        getRootState: jest.fn(),
    },
}));

function mockDomainNavigationState(domainAccountID: number) {
    jest.mocked(navigationRef).isReady.mockReturnValue(true);
    jest.mocked(navigationRef).getRootState.mockReturnValue(
        createMock<ReturnType<typeof navigationRef.getRootState>>({
            routes: [
                {
                    key: 'domain-split',
                    name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    state: {
                        key: 'domain-split-state',
                        routes: [
                            {
                                key: 'domain-sidebar',
                                name: SCREENS.DOMAIN.INITIAL,
                                params: {domainAccountID},
                            },
                            {
                                key: 'domain-members',
                                name: SCREENS.DOMAIN.MEMBERS,
                                params: {domainAccountID},
                            },
                        ],
                    },
                },
            ],
        }),
    );
}

describe('navigateToDomainSettingsRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates the persistent sidebar before navigating to another Domain', () => {
        mockDomainNavigationState(100);
        const targetRoute = ROUTES.DOMAIN_SAML.getRoute(200);

        navigateToDomainSettingsRoute(targetRoute, 200, false);

        expect(Navigation.setParams).toHaveBeenCalledWith({domainAccountID: 200}, 'domain-sidebar', 'domain-split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(jest.mocked(Navigation.setParams).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('does not update the sidebar when navigating within the same Domain', () => {
        mockDomainNavigationState(100);
        const targetRoute = ROUTES.DOMAIN_SAML.getRoute(100);

        navigateToDomainSettingsRoute(targetRoute, 100, false);

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
    });

    it('navigates directly on narrow layouts', () => {
        mockDomainNavigationState(100);
        const targetRoute = ROUTES.DOMAIN_SAML.getRoute(200);

        navigateToDomainSettingsRoute(targetRoute, 200, true);

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
    });
});
