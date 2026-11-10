import {render} from '@testing-library/react-native';

import PersonalAddressPage from '@pages/settings/Profile/PersonalDetails/PersonalAddressPage';

import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

const mockAddressPage = jest.fn();
const mockUseRoute = jest.fn<{name: string; params: {fieldToFocus?: string}}, []>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useRoute: () => mockUseRoute(),
}));
jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);
jest.mock('@pages/AddressPage', () => ({
    __esModule: true,
    default: (props: {shouldAutoFocusAddressLine1: boolean}) => {
        mockAddressPage(props);
        return null;
    },
}));

describe('PersonalAddressPage focus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, 'addressLine1', true],
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, undefined, false],
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, 'city', false],
        [SCREENS.SETTINGS.PROFILE.ADDRESS, 'addressLine1', false],
    ])('limits focus to the home-address route with opt-in intent: %s / %s', (name, fieldToFocus, expectedFocus) => {
        // Given the shared page can open from Preferences, Profile, or the message link
        mockUseRoute.mockReturnValue({name, params: {fieldToFocus}});

        // When that route renders the address page
        render(<PersonalAddressPage />);

        // Then only the message link's home-address focus intent reaches the address form
        expect(mockAddressPage).toHaveBeenCalledWith(expect.objectContaining({shouldAutoFocusAddressLine1: expectedFocus}));
    });
});
