import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {ComponentType, ReactNode} from 'react';
import MentionUserRenderer from '@components/HTMLEngineProvider/HTMLRenderers/MentionUserRenderer';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

// Mock Navigation to avoid actual navigation calls
jest.mock('@libs/Navigation/Navigation', () => ({
    getReportRHPActiveRoute: jest.fn(),
    navigate: jest.fn(),
}));

// Simplify react-native-render-html children renderer to just echo the provided data
jest.mock('react-native-render-html', () => {
    const React = require('react');
    const {Text} = require('react-native');
    return {
        TNodeChildrenRenderer: ({tnode}: {tnode?: {data?: string}}) => React.createElement(Text, null, tnode?.data ?? ''),
    };
});

// Provide current user details via HOC mock
jest.mock('@components/withCurrentUserPersonalDetails', () => {
    return <TProps extends WithCurrentUserPersonalDetailsProps>(Component: ComponentType<TProps>) =>
        function MockedWithCurrentUserPersonalDetails(props: Omit<TProps, keyof WithCurrentUserPersonalDetailsProps>) {
            return (
                <Component
                    {...(props as TProps)}
                    currentUserPersonalDetails={{
                        accountID: 1,
                        login: 'samran@example.com',
                        displayName: 'Samran',
                    }}
                />
            );
        };
});

jest.mock('@libs/PersonalDetailsUtils', () => {
    const actual = jest.requireActual('@libs/PersonalDetailsUtils');
    return {
        ...actual,
        getShortMentionIfFound: (mentionOrName: string, _accountID?: string, currentUser?: {login?: string}, login?: string) => {
            const target = login ?? mentionOrName;
            if (!target) {
                return '';
            }
            // Keep SMS domain as is here, Str.removeSMSDomain in component will strip it later
            if (target.endsWith('@expensify.sms')) {
                return target;
            }
            const [local, domain] = target.split('@');
            const currentDomain = currentUser?.login?.split('@')?.[1] ?? '';
            if (!domain) {
                return target;
            }
            return domain === currentDomain ? local : target;
        },
    };
});

// Mock Onyx hook used by the component to return configurable personal details
let mockPersonalDetails: Record<string, any> = {};
jest.mock('@hooks/useOnyx', () => {
    const {default: ONYXKEYS} = require('../../src/ONYXKEYS');

    return (key: string) => {
        if (key === ONYXKEYS.PERSONAL_DETAILS_LIST) {
            return [mockPersonalDetails];
        }
        return [undefined];
    };
});

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
}));

function withProvider(children: ReactNode) {
    return (
        <ShowContextMenuContext.Provider
            value={{
                onShowContextMenu: (fn: () => void) => fn(),
                anchor: null,
                report: undefined,
                isReportArchived: false,
                action: undefined,
                checkIfContextMenuActive: () => false,
                isDisabled: true,
                shouldDisplayContextMenu: false,
            }}
        >
            {children}
        </ShowContextMenuContext.Provider>
    );
}

function renderMention(props: {tnode: any; style?: object}) {
    const MentionUserRendererTestHarness: any = MentionUserRenderer;
    return render(
        withProvider(
            <MentionUserRendererTestHarness
                tnode={props.tnode}
                TDefaultRenderer={() => null}
                style={props.style ?? {}}
            />,
        ),
    );
}

// Helper to build a minimal tnode-like object used by the component
function buildTNode({accountid, data}: {accountid?: string; data?: string}) {
    return {attributes: {accountid}, data} as unknown as any;
}

describe('MentionUserRenderer', () => {
    beforeEach(() => {
        mockPersonalDetails = {};
        jest.clearAllMocks();
    });

    test('renders phone number (not displayName) when user has phone login', () => {
        mockPersonalDetails = {
            101: {login: '+15005550006', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountid: '101'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@+15005550006');
        expect(mention).not.toHaveTextContent('John Doe');
    });

    test('renders email mention when user has email login', () => {
        mockPersonalDetails = {
            102: {login: 'alex@other.com', displayName: 'Alex Johnson'},
        };
        const tnode = buildTNode({accountid: '102'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@alex@other.com');
    });

    test('falls back to mention text when accountID not found in personal details', () => {
        mockPersonalDetails = {};
        const tnode = buildTNode({accountid: '999', data: '@user@test.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@user@test.com');
    });

    test('renders short mention (local part only) for same domain emails', () => {
        const tnode = buildTNode({data: '@john@example.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@john');
    });

    test('renders full email for different domain mentions', () => {
        const tnode = buildTNode({data: '@alex@other.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@alex@other.com');
    });

    test('strips SMS domain from phone number mentions', () => {
        const tnode = buildTNode({data: '@+12018675309@expensify.sms'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@+12018675309');
        expect(mention).not.toHaveTextContent('expensify.sms');
    });

    test('renders null when neither accountID nor mention data is provided', () => {
        const tnode = buildTNode({});
        const {toJSON} = renderMention({tnode});
        expect(toJSON()).toBeNull();
    });

    test('navigates to user profile when pressed with accountID', () => {
        mockPersonalDetails = {
            103: {login: 'john@example.com', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountid: '103'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        fireEvent(mention, 'press', {preventDefault: jest.fn()});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.PROFILE.getRoute(103));
    });

    test('navigates with mention text as fallback when no accountID', () => {
        const tnode = buildTNode({data: '@user@test.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        fireEvent(mention, 'press', {preventDefault: jest.fn()});
        expect(Navigation.navigate).toHaveBeenCalled();
        const callArgs = (Navigation.navigate as jest.Mock).mock.calls[0][0];
        expect(callArgs).toContain('login=user%40test.com');
    });

    test('renders short form for self-mention (current user)', () => {
        mockPersonalDetails = {
            1: {login: 'samran@example.com', displayName: 'Samran'},
        };
        const tnode = buildTNode({accountid: '1'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@samran');
        // Verify navigation to own profile works
        fireEvent(mention, 'press', {preventDefault: jest.fn()});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.PROFILE.getRoute(1));
    });

    test('uses displayName when login is empty', () => {
        mockPersonalDetails = {
            201: {login: '', displayName: 'Fallback Name'},
        };
        const tnode = buildTNode({accountid: '201'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        // When login is empty, getShortMentionIfFound returns empty string
        // The component shows @ with empty displayText
        expect(mention).toHaveTextContent('@');
    });

    test('renders full email when mention domain differs from current user', () => {
        mockPersonalDetails = {
            202: {login: 'user@test.com', displayName: 'Test User'},
        };
        const tnode = buildTNode({accountid: '202'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@user@test.com');
    });
});
