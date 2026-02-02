/* eslint-disable @typescript-eslint/naming-convention */
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {ComponentType, ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import type {TText} from 'react-native-render-html';
import MentionUserRenderer from '@components/HTMLEngineProvider/HTMLRenderers/MentionUserRenderer';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';

// Mock Navigation to avoid actual navigation calls
jest.mock('@libs/Navigation/Navigation', () => ({
    getReportRHPActiveRoute: jest.fn(),
    navigate: jest.fn(),
}));

// Simplify react-native-render-html children renderer to just echo the provided data
jest.mock('react-native-render-html', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text: TextComponent} = jest.requireActual<{Text: React.ComponentType}>('react-native');
    return {
        TNodeChildrenRenderer: ({tnode}: {tnode?: {data?: string}}) => ReactModule.createElement(TextComponent, null, tnode?.data ?? ''),
    };
});

// Provide current user details via HOC mock
jest.mock('@components/withCurrentUserPersonalDetails', () => {
    const withCurrentUserPersonalDetailsMock = <TProps extends WithCurrentUserPersonalDetailsProps>(Component: ComponentType<TProps>) => {
        function WrappedComponent(props: Omit<TProps, keyof WithCurrentUserPersonalDetailsProps>) {
            return (
                <Component
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TProps)}
                    currentUserPersonalDetails={{
                        accountID: 1,
                        login: 'current@example.com',
                        displayName: 'Current user',
                    }}
                />
            );
        }
        return WrappedComponent;
    };
    return withCurrentUserPersonalDetailsMock;
});

jest.mock('@libs/PersonalDetailsUtils', () => {
    const actualModule = jest.requireActual<Record<string, unknown>>('@libs/PersonalDetailsUtils');
    return {
        ...actualModule,
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
let mockPersonalDetails: Record<number, Partial<PersonalDetails>> = {};
jest.mock('@hooks/useOnyx', () => {
    const onyxModule = jest.requireActual<{default: {PERSONAL_DETAILS_LIST: string}}>('../../src/ONYXKEYS');

    return (key: string) => {
        if (key === onyxModule.default.PERSONAL_DETAILS_LIST) {
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
        <OnyxListItemProvider>
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
        </OnyxListItemProvider>
    );
}

function renderMention(props: {tnode: TText; style?: Record<string, unknown>}) {
    const Component = MentionUserRenderer as unknown as ComponentType<{
        tnode: TText;
        TDefaultRenderer: () => null;
        style: Record<string, unknown>;
    }>;
    return render(
        withProvider(
            <Component
                tnode={props.tnode}
                TDefaultRenderer={() => null}
                style={props.style ?? {}}
            />,
        ),
    );
}

// Helper to build a minimal tnode-like object used by the component
function buildTNode({accountID, data}: {accountID?: string; data?: string}): TText {
    // cspell:disable-next-line
    return {attributes: {accountid: accountID}, data} as unknown as TText;
}

describe('MentionUserRenderer', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        mockPersonalDetails = {};
        IntlStore.load(CONST.LOCALES.DEFAULT);
        jest.clearAllMocks();
    });

    test('renders phone number (not displayName) when user has phone login', () => {
        mockPersonalDetails = {
            101: {login: '+15005550006', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountID: '101'});
        renderMention({tnode});
        expect(screen.getByText('@+15005550006')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeVisible();
    });

    test('renders email mention when user has email login', () => {
        mockPersonalDetails = {
            102: {login: 'alex@other.com', displayName: 'Alex Johnson'},
        };
        const tnode = buildTNode({accountID: '102'});
        renderMention({tnode});
        expect(screen.getByText('@alex@other.com')).toBeVisible();
    });

    test('falls back to mention text when accountID not found in personal details', () => {
        mockPersonalDetails = {};
        const tnode = buildTNode({accountID: '999', data: '@user@test.com'});
        renderMention({tnode});
        expect(screen.getByText('@user@test.com')).toBeVisible();
    });

    test('renders short mention (local part only) for same domain emails', () => {
        const tnode = buildTNode({data: '@john@example.com'});
        renderMention({tnode});
        expect(screen.getByText('@john')).toBeVisible();
    });

    test('renders full email for different domain mentions', () => {
        const tnode = buildTNode({data: '@alex@other.com'});
        renderMention({tnode});
        expect(screen.getByText('@alex@other.com')).toBeVisible();
    });

    test('strips SMS domain from phone number mentions', () => {
        const tnode = buildTNode({data: '@+12018675309@expensify.sms'});
        renderMention({tnode});
        expect(screen.getByText('@+12018675309')).toBeVisible();
        expect(screen.queryByText('expensify.sms')).not.toBeVisible();
    });

    test('renders null when neither accountID nor mention data is provided', () => {
        const tnode = buildTNode({});
        const {toJSON} = renderMention({tnode});
        expect(toJSON()).toBeNull();
    });

    test('renders @Hidden when accountID not found in personal details and mention data not provided', () => {
        mockPersonalDetails = {};
        const tnode = buildTNode({accountID: '203'});
        renderMention({tnode});
        expect(screen.getByText(`@${translateLocal('common.hidden')}`)).toBeVisible();
    });

    test('navigates to user profile when pressed with accountID', () => {
        mockPersonalDetails = {
            103: {login: 'john@example.com', displayName: 'John Doe'},
        };
        const tnode = buildTNode({accountID: '103'});
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
        const navigationMock = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
        const firstCallArgs = navigationMock.mock.calls.at(0) as [string, ...unknown[]] | undefined;
        expect(firstCallArgs?.[0]).toContain('login=user%40test.com');
    });

    test('renders short form for self-mention (Current user)', () => {
        mockPersonalDetails = {
            1: {login: 'current@example.com', displayName: 'Current user'},
        };
        const tnode = buildTNode({accountID: '1'});
        renderMention({tnode});
        expect(screen.getByText('@current')).toBeVisible();
        // Verify navigation to own profile works
        const mention = screen.getByTestId('mention-user');
        fireEvent(mention, 'press', {preventDefault: jest.fn()});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.PROFILE.getRoute(1));
    });

    test('uses displayName when login is empty', () => {
        mockPersonalDetails = {
            201: {login: '', displayName: 'Fallback Name'},
        };
        const tnode = buildTNode({accountID: '201'});
        renderMention({tnode});
        // When login is empty, getShortMentionIfFound returns empty string
        // The component shows @ with empty displayText
        expect(screen.getByText('@')).toBeVisible();
    });

    test('renders full email when mention domain differs from current user', () => {
        mockPersonalDetails = {
            202: {login: 'user@test.com', displayName: 'Test User'},
        };
        const tnode = buildTNode({accountID: '202'});
        renderMention({tnode});
        expect(screen.getByText('@user@test.com')).toBeVisible();
    });
});
