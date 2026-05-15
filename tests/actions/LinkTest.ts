import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {openLink} from '@libs/actions/Link';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => true));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    closeRHPFlow: jest.fn(),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(() => ({routes: [{name: 'Root'}]})),
}));

describe('Link.openLink', () => {
    const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
    const mockGetRootState = navigationRef.getRootState as jest.MockedFunction<typeof navigationRef.getRootState>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetRootState.mockReturnValue({routes: [{name: 'Root'}]} as unknown as ReturnType<typeof navigationRef.getRootState>);
    });

    it('navigates New Expensify links in-app even when environment differs', () => {
        openLink('https://new.expensify.com/settings/wallet', 'https://staging.new.expensify.com');

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('settings/wallet');
    });
});
