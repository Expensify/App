import {render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import ContactMethodsPage from '@pages/settings/Profile/Contacts/ContactMethodsPage';
import DelegateNoAccessModalProvider from '@src/components/DelegateNoAccessModalProvider';
import LockedAccountModalProvider from '@src/components/LockedAccountModalProvider';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock navigation used by the page
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

// Mock RenderHTML component
jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

// Replace MenuItem with a simple test double that exposes props in the tree
jest.mock('@components/MenuItem', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID: string; children?: React.ReactNode}>};
    return ({title, brickRoadIndicator}: {title: string; brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>}) =>
        ReactMock.createElement(Text, {testID: `menu-${String(title)}`}, `${brickRoadIndicator ?? 'none'}-brickRoadIndicator`);
});

describe('ContactMethodsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    function renderPage() {
        return render(
            <ComposeProviders components={[LockedAccountModalProvider, DelegateNoAccessModalProvider]}>
                {/* @ts-expect-error - route typing is not necessary for this test */}
                <ContactMethodsPage route={{params: {}}} />
            </ComposeProviders>,
        );
    }

    it('sets error indicator when login has error fields', async () => {
        // Given a login list entry with errorFields set
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
                errorFields: {
                    error: {field: 'dummy'},
                },
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // ContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // ContactMethodsPage sets brickRoadIndicator to 'error' when any errorFields are present
        expect(node).toHaveTextContent('error-brickRoadIndicator');

        // Verify that RBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
                errorFields: null,
            },
        });

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
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

        renderPage();
        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // ContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
        expect(node).toHaveTextContent('info-brickRoadIndicator');

        // Verify that GBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
            },
        });

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('info-brickRoadIndicator');
        });
    });
});
