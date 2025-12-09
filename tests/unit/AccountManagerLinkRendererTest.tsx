import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import AccountManagerLinkRenderer from '@components/HTMLEngineProvider/HTMLRenderers/AccountManagerLinkRenderer';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@components/HTMLEngineProvider/htmlEngineUtils', () => ({
    isChildOfRBR: jest.fn(() => false),
    getFontSizeOfRBRChild: jest.fn(() => 15),
}));

jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('react-native-render-html');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        TNodeChildrenRenderer: ({tnode}: {tnode: {mockText?: string}}) => tnode.mockText ?? 'Account Manager',
    };
});

const ACCOUNT_MANAGER_REPORT_ID = '123456789';

const createMockTNode = (text = 'Account Manager') => ({
    type: 'phrasing',
    mockText: text,
    domNode: {
        name: 'account-manager-link',
        attribs: {},
    },
    children: [],
    parent: null,
    nodeIndex: 0,
});

describe('AccountManagerLinkRenderer', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the link with correct text', () => {
        // @ts-expect-error Ignoring type errors for testing purposes
        render(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        expect(screen.getByText('Account Manager')).toBeTruthy();
    });

    it('should navigate to account manager chat when pressed', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, ACCOUNT_MANAGER_REPORT_ID);

        // @ts-expect-error Ignoring type errors for testing purposes
        render(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        const link = screen.getByText('Account Manager');
        fireEvent.press(link);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ACCOUNT_MANAGER_REPORT_ID));
    });

    it('should not navigate when accountManagerReportID is undefined', async () => {
        // @ts-expect-error Ignoring type errors for testing purposes
        render(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        const link = screen.getByText('Account Manager');
        fireEvent.press(link);

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple presses correctly', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, ACCOUNT_MANAGER_REPORT_ID);

        // @ts-expect-error Ignoring type errors for testing purposes
        render(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        const link = screen.getByText('Account Manager');

        fireEvent.press(link);
        fireEvent.press(link);
        fireEvent.press(link);

        expect(Navigation.navigate).toHaveBeenCalledTimes(3);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ACCOUNT_MANAGER_REPORT_ID));
    });

    it('should update navigation when accountManagerReportID changes', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, ACCOUNT_MANAGER_REPORT_ID);

        // @ts-expect-error Ignoring type errors for testing purposes
        const {rerender} = render(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        const link = screen.getByText('Account Manager');
        fireEvent.press(link);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ACCOUNT_MANAGER_REPORT_ID));

        const NEW_ACCOUNT_MANAGER_REPORT_ID = '987654321';
        await Onyx.merge(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, NEW_ACCOUNT_MANAGER_REPORT_ID);

        // @ts-expect-error Ignoring type errors for testing purposes
        rerender(<AccountManagerLinkRenderer tnode={createMockTNode('Account Manager')} />);

        const updatedLink = screen.getByText('Account Manager');
        fireEvent.press(updatedLink);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(NEW_ACCOUNT_MANAGER_REPORT_ID));
    });
});
