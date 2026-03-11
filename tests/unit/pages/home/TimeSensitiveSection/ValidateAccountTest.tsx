import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ValidateAccount from '@src/pages/home/TimeSensitiveSection/items/ValidateAccount';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        EnvelopeOpenStar: () => null,
    })),
}));

const renderValidateAccount = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ValidateAccount />
        </ComposeProviders>,
    );
};

describe('ValidateAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('renders correctly with proper text', () => {
        renderValidateAccount();

        expect(screen.getByText('Validate your account to continue using Expensify')).toBeTruthy();
        expect(screen.getByText('Account')).toBeTruthy();
        expect(screen.getByText('Validate')).toBeTruthy();
    });

    it('navigates to verify account page on CTA press', () => {
        renderValidateAccount();

        fireEvent.press(screen.getByText('Validate'));

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute());
    });
});
