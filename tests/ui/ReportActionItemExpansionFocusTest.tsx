import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';

import {setHasRadio} from '@libs/NetworkState';
import type * as UrlType from '@libs/Url';

import ReportActionItem from '@pages/inbox/report/ReportActionItem';

import type CONFIGType from '@src/CONFIG';
import type CONSTType from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import type {View} from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');
// The real row owns the host/ref/focus lifecycle; content rendering has its own suites.
jest.mock('@pages/inbox/report/actionContents/ActionContentRouter', () => jest.fn(() => null));

jest.mock('@libs/actions/Link', () => {
    const Url = jest.requireActual<typeof UrlType>('@libs/Url');
    const CONSTreal = jest.requireActual<{default: typeof CONSTType}>('@src/CONST').default;
    const CONFIGreal = jest.requireActual<{default: typeof CONFIGType}>('@src/CONFIG').default;
    return {
        openLink: jest.fn(),
        openOldDotLink: jest.fn(),
        openExternalLink: jest.fn(),
        openTravelDotLink: jest.fn(),
        openReportFromDeepLink: jest.fn(),
        getTravelDotLink: jest.fn(),
        buildOldDotURL: jest.fn(),
        buildTravelDotURL: jest.fn(),
        getInternalNewExpensifyPath: (href: string) => {
            if (!href) {
                return '';
            }
            const attrPath = Url.getPathFromURL(href);
            return (Url.hasSameExpensifyOrigin(href, CONSTreal.NEW_EXPENSIFY_URL) ||
                Url.hasSameExpensifyOrigin(href, CONSTreal.STAGING_NEW_EXPENSIFY_URL) ||
                Url.hasSameExpensifyOrigin(href, CONSTreal.QA_NEW_EXPENSIFY_URL) ||
                href.startsWith(CONSTreal.DEV_NEW_EXPENSIFY_URL)) &&
                !CONSTreal.PATHS_TO_TREAT_AS_EXTERNAL.find((p) => attrPath.startsWith(p))
                ? attrPath
                : '';
        },
        getInternalExpensifyPath: (href: string) => {
            if (!href) {
                return '';
            }
            const attrPath = Url.getPathFromURL(href);
            const hasExpensifyOrigin = Url.hasSameExpensifyOrigin(href, CONFIGreal.EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIGreal.EXPENSIFY.STAGING_API_ROOT);
            if (!hasExpensifyOrigin || attrPath.startsWith(CONFIGreal.EXPENSIFY.CONCIERGE_URL_PATHNAME) || attrPath.startsWith(CONFIGreal.EXPENSIFY.DEVPORTAL_URL_PATHNAME)) {
                return '';
            }
            return attrPath;
        },
    };
});

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const ACTOR_ACCOUNT_ID = 123456789;
const actorEmail = 'test@test.com';

const createReportAction = (actionName: ReportActionName, originalMessageExtras: Partial<OriginalMessage<ReportActionName>>) =>
    createMock<ReportAction>({
        reportActionID: '12345',
        actorAccountID: ACTOR_ACCOUNT_ID,
        created: '2025-07-12 09:03:17.653',
        actionName,
        automatic: true,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
        message: [{type: 'COMMENT', html: 'some message', text: 'some message'}],

        originalMessage: {
            ...originalMessageExtras,
        },
    });

describe('ReportActionItem expansion focus', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        setHasRadio(true);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ACTOR_ACCOUNT_ID]: {
                    accountID: ACTOR_ACCOUNT_ID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_9.png',
                    displayName: actorEmail,
                    login: actorEmail,
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    function getItemWithAction(action: ReportAction, isLatestConciergeFeedbackAction = false, onExpandedSystemMessageReady?: (target: React.ComponentRef<typeof View> | null) => void) {
        return (
            <ComposeProviders
                components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrencyListContextProvider, HTMLEngineProvider, PlaybackContextProvider]}
            >
                <ScreenWrapper testID="test">
                    <PortalProvider>
                        <ReportActionItem
                            reportsParentHierarchy={undefined}
                            chatReport={undefined}
                            report={undefined}
                            transactionThreadReport={undefined}
                            parentReportAction={undefined}
                            action={action}
                            displayAsGroup={false}
                            shouldDisplayNewMarker={false}
                            isFirstVisibleReportAction={false}
                            isLatestConciergeFeedbackAction={isLatestConciergeFeedbackAction}
                            onExpandedSystemMessageReady={onExpandedSystemMessageReady}
                        />
                    </PortalProvider>
                </ScreenWrapper>
            </ComposeProviders>
        );
    }

    function renderItemWithAction(
        action: ReportAction,
        isLatestConciergeFeedbackAction = false,
        onExpandedSystemMessageReady?: (target: React.ComponentRef<typeof View> | null) => void,
        focusTarget?: React.ComponentRef<typeof View>,
    ) {
        return render(
            getItemWithAction(action, isLatestConciergeFeedbackAction, onExpandedSystemMessageReady),
            focusTarget
                ? {
                      createNodeMock: (element: React.ReactElement) => {
                          const props = element.props;
                          return props &&
                              typeof props === 'object' &&
                              'accessibilityLabel' in props &&
                              typeof props.accessibilityLabel === 'string' &&
                              props.accessibilityLabel.includes('some message')
                              ? focusTarget
                              : null;
                      },
                  }
                : undefined,
        );
    }

    it('hands a recycled message host to the expansion request without requiring another layout event', async () => {
        // Given a mounted row with no expansion request, as in a warmed FlashList recycle pool
        const target = createMock<React.ComponentRef<typeof View>>({focus: jest.fn()});
        const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {});
        const {rerender} = renderItemWithAction(action, false, undefined, target);
        await waitForBatchedUpdatesWithAct();
        const frames = new Map<number, FrameRequestCallback>();
        let frameID = 0;
        const frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            frames.set(++frameID, callback);
            return frameID;
        });
        const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => {
            if (typeof id !== 'number') {
                return;
            }
            frames.delete(id);
        });
        const onReady = jest.fn();
        try {
            // When the retained row is assigned the first revealed update, with unchanged geometry
            rerender(getItemWithAction({...action, reportActionID: 'revealed-oldest'}, false, onReady));
            expect(onReady).not.toHaveBeenCalled();
            act(() => {
                for (const callback of [...frames.values()]) {
                    callback(0);
                }
            });

            // Then its existing labeled host receives the handoff after commit, without a synthetic layout
            expect(onReady).toHaveBeenCalledTimes(1);
            expect(onReady).toHaveBeenCalledWith(target);
        } finally {
            frameSpy.mockRestore();
            cancelSpy.mockRestore();
        }
    });

    it('cancels the handoff if the message is recycled before the next frame', async () => {
        const target = createMock<React.ComponentRef<typeof View>>({focus: jest.fn()});
        const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {});
        const {rerender} = renderItemWithAction(action, false, undefined, target);
        await waitForBatchedUpdatesWithAct();
        const frames = new Map<number, FrameRequestCallback>();
        let frameID = 0;
        const frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            frames.set(++frameID, callback);
            return frameID;
        });
        const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => {
            if (typeof id !== 'number') {
                return;
            }
            frames.delete(id);
        });
        const onReady = jest.fn();
        try {
            rerender(getItemWithAction({...action, reportActionID: 'revealed-oldest'}, false, onReady));
            rerender(getItemWithAction({...action, reportActionID: 'another-message'}));
            act(() => {
                for (const callback of [...frames.values()]) {
                    callback(0);
                }
            });
            expect(onReady).not.toHaveBeenCalled();
        } finally {
            frameSpy.mockRestore();
            cancelSpy.mockRestore();
        }
    });
});
