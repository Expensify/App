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
                        login: 'samran@corp.com',
                        displayName: 'Me',
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

    test('AccountID present + user found (phone login): renders @+15005550006 and not displayName', () => {
        mockPersonalDetails = {
            123: {login: '+15005550006', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountid: '123'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@+15005550006');
        expect(mention).not.toHaveTextContent('John Doe');
    });

    test('AccountID present + user found (email login with displayName): renders @', () => {
        mockPersonalDetails = {
            456: {login: 'alex@domain.com', displayName: 'Alex Johnson'},
        };
        const tnode = buildTNode({accountid: '456'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent(/^@/);
    });

    test('AccountID present but user missing + mention email provided: falls back to mention', () => {
        mockPersonalDetails = {};
        const tnode = buildTNode({accountid: '789', data: '@user@test.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@user@test.com');
    });

    test('No accountID + mention email from same private domain: renders short mention (local part only)', () => {
        const tnode = buildTNode({data: '@john@corp.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@john');
    });

    test('No accountID + mention email from different domain: renders full email', () => {
        const tnode = buildTNode({data: '@alex@other.com'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@alex@other.com');
    });

    test('No accountID + SMS mention: renders number without SMS domain', () => {
        const tnode = buildTNode({data: '@+12018675309@expensify.sms'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        expect(mention).toHaveTextContent('@+12018675309');
        expect(mention).not.toHaveTextContent('expensify.sms');
    });

    test('Neither accountID nor mention provided: renders null', () => {
        const tnode = buildTNode({});
        const {toJSON} = renderMention({tnode});
        expect(toJSON()).toBeNull();
    });

    test('navigates to user profile on press', () => {
        mockPersonalDetails = {
            123: {login: 'john@corp.com', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountid: '123'});
        renderMention({tnode});
        const mention = screen.getByTestId('mention-user');
        fireEvent(mention, 'press', {preventDefault: jest.fn()});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.PROFILE.getRoute(123));
    });
});
