import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
// eslint-disable-next-line no-restricted-syntax
import * as UserActions from '@libs/actions/User';
import ContactMethodDetailsPage from '@pages/settings/Profile/Contacts/ContactMethodDetailsPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MockFetch} from '../utils/TestHelper';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@components/DelegateNoAccessModalProvider');

jest.mock('@libs/actions/User', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@libs/actions/User');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        resetContactMethodValidateCodeSentState: jest.fn(),
    };
});

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

const fakeEmail = 'fake@gmail.com';
const mockRoute = {
    params: {
        backTo: '',
        contactMethod: fakeEmail,
    },
};
const mockLoginList = {
    [fakeEmail]: {
        partnerName: 'expensify.com',
        partnerUserID: fakeEmail,
        validatedDate: 'fake-validatedDate',
    },
};

describe('ContactMethodDetailsPage', () => {
    let mockFetch: MockFetch;
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    function ContactMethodDetailsPageRenderer() {
        return (
            <HTMLProviderWrapper>
                <ContactMethodDetailsPage
                    // @ts-expect-error - Ignoring type errors for testing purposes
                    route={mockRoute}
                />
            </HTMLProviderWrapper>
        );
    }

    it('should not call resetContactMethodValidateCodeSentState when we got a delete pending field', async () => {
        // Given a login list with a validated contact method
        Onyx.merge(ONYXKEYS.LOGIN_LIST, mockLoginList);
        await waitForBatchedUpdates();

        // Given the page is rendered
        render(<ContactMethodDetailsPageRenderer />);

        // When a deleteContactMethod called
        UserActions.deleteContactMethod(fakeEmail, mockLoginList);
        await waitForBatchedUpdatesWithAct();

        // When the deletion is successful
        mockFetch?.succeed();
        await waitForBatchedUpdates();
        mockFetch?.resume();
        await waitForBatchedUpdates();

        // Then resetContactMethodValidateCodeSentState should not be called
        expect(UserActions.resetContactMethodValidateCodeSentState).not.toHaveBeenCalled();
    });

    it('should not call resetContactMethodValidateCodeSentState when the login data has no partnerUserID', async () => {
        // Given a login list with a contact method that has no partnerUserID
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [fakeEmail]: {
                partnerName: 'expensify.com',
                partnerUserID: '',
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        // Given the page is rendered
        render(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();

        // Then resetContactMethodValidateCodeSentState should not be called
        expect(UserActions.resetContactMethodValidateCodeSentState).not.toHaveBeenCalled();
    });
});
