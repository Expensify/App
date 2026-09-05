import toggleTestToolsModal from '@libs/actions/TestTool';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRoute: jest.fn(),
        goBack: jest.fn(),
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    current: {
        canGoBack: jest.fn(),
        getCurrentRoute: jest.fn(),
    },
}));

function getMockNavigationRef() {
    const currentNavigationRef = navigationRef.current;
    if (!currentNavigationRef) {
        throw new Error('Expected a mocked navigation ref');
    }
    return currentNavigationRef;
}

describe('actions/TestTool', () => {
    const backToRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-a');

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        jest.mocked(Navigation.getActiveRoute).mockReturnValue(ROUTES.TEST_TOOLS_MODAL.getRoute(backToRoute));
        jest.spyOn(getMockNavigationRef(), 'getCurrentRoute').mockReturnValue({name: SCREENS.TEST_TOOLS_MODAL.ROOT, key: 'test-tools', params: {backTo: backToRoute}});
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('pops Test Tools when it has an underlying route and uses backTo for direct entry', () => {
        jest.spyOn(getMockNavigationRef(), 'canGoBack').mockReturnValue(true);

        toggleTestToolsModal();

        expect(Navigation.goBack).toHaveBeenCalledWith();

        jest.advanceTimersByTime(801);
        jest.mocked(Navigation.goBack).mockClear();
        jest.spyOn(getMockNavigationRef(), 'canGoBack').mockReturnValue(false);

        toggleTestToolsModal();

        expect(Navigation.goBack).toHaveBeenCalledWith(backToRoute);
    });
});
