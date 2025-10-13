import React from 'react';
import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock navigation used by the page
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

// Mock contexts consumed by the page
jest.mock('@components/DelegateNoAccessModalProvider', () => {
    const ReactActual = jest.requireActual('react');
    return {
        DelegateNoAccessContext: ReactActual.createContext({isActingAsDelegate: false, showDelegateNoAccessModal: jest.fn()}),
    };
});

jest.mock('@components/LockedAccountModalProvider', () => {
    const ReactActual = jest.requireActual('react');
    return {
        LockedAccountContext: ReactActual.createContext({isAccountLocked: false, showLockedAccountModal: jest.fn()}),
    };
});

// Replace MenuItem with a simple test double that exposes props in the tree
jest.mock('@components/MenuItem', () => {
    const ReactActual = require('react');
    const {Text} = require('react-native');
    return ({title, brickRoadIndicator}: any) => ReactActual.createElement(Text, {testID: `menu-${String(title)}`}, brickRoadIndicator ?? 'none');
});

// Import the component under test AFTER mocks so they take effect
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const ContactMethodsPage = require('@pages/settings/Profile/Contacts/ContactMethodsPage').default as typeof import('@pages/settings/Profile/Contacts/ContactMethodsPage').default;

describe('ContactMethodsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    async function renderPage() {
        return render(
            // @ts-expect-error - route typing is not necessary for this test
            <ContactMethodsPage route={{params: {}}} />,
        );
    }

    it('sets error indicator when login has error fields', async () => {
        // Given a login list entry with errorFields set
        const email = 'primary@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email});
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [email]: {
                partnerUserID: email,
                validatedDate: '',
                errorFields: {
                    error: {field: 'dummy'},
                },
            },
        });
        await waitForBatchedUpdates();

        await renderPage();
        const node = screen.getByTestId(`menu-${email}`);
        // ContactMethodsPage sets brickRoadIndicator to 'error' when any errorFields are present
        expect(node.props.children).toBe('error');
    });

    it('sets info indicator when login is unvalidated and not default', async () => {
        // Given two logins: default (session email) validated, and another unvalidated
        const defaultEmail = 'default@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email: defaultEmail});
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [defaultEmail]: {
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        await renderPage();
        const otherNode = screen.getByTestId(`menu-${otherEmail}`);
        // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
        expect(otherNode.props.children).toBe('info');
    });
});


