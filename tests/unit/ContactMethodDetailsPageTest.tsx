import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
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

jest.mock('@libs/actions/User', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@libs/actions/User');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        resetContactMethodValidateCodeSentState: jest.fn(),
    };
});

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
            <ContactMethodDetailsPage
                // @ts-expect-error - Ignoring type errors for testing purposes
                route={mockRoute}
            />
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
});
