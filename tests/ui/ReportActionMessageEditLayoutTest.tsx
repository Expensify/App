import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {KeyboardStateProvider} from '@components/withKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {ReportActionComposeProps} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import {ReportActionEditMessageContextProvider} from '@pages/inbox/report/ReportActionEditMessageContext';
import type {ReportActionItemMessageEditProps} from '@pages/inbox/report/ReportActionItemMessageEdit';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/**
 * Exercises where message edit appears on narrow (main @ReportActionCompose) vs wide (@ReportActionItemMessageEdit),
 * draft set/unset, and layout switching. TestIDs: CONST.COMPOSER.TEST_ID.*
 */

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const narrowLayout: ReturnType<typeof useResponsiveLayout> = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isMediumScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: false,
    isLargeScreenWidth: false,
    isSmallScreen: true,
} as ReturnType<typeof useResponsiveLayout>;

const wideLayout: ReturnType<typeof useResponsiveLayout> = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isMediumScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isLargeScreenWidth: true,
    isSmallScreen: false,
} as ReturnType<typeof useResponsiveLayout>;

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

jest.mock('@libs/ComponentUtils', () => ({
    forceClearInput: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/usePaginatedReportActions', () => jest.fn(() => ({reportActions: [], hasNewerActions: false, hasOlderActions: false})));
jest.mock('@hooks/useParentReportAction', () => jest.fn(() => null));
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn(() => ({})));
jest.mock('@hooks/useShortMentionsList', () => jest.fn(() => ({availableLoginsList: []})));
jest.mock('@hooks/useSidePanelState', () => jest.fn(() => ({sessionStartTime: null})));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        editReportComment: jest.fn(),
    };
});

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ContextMenu/ReportActionContextMenu');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        showDeleteModal: jest.fn(),
    };
});

jest.mock('@components/DropZone/DualDropZone', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({shouldAcceptSingleReceipt}: {shouldAcceptSingleReceipt?: boolean}) => (
        <RN.Text testID="dual-drop-zone">{shouldAcceptSingleReceipt ? 'receipt-editable' : 'receipt-not-editable'}</RN.Text>
    );
});

const mockRouteReportID = {current: '1'};

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: mockRouteReportID.current}})),
}));

TestHelper.setupGlobalFetchMock();

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const defaultReport = LHNTestUtils.getFakeReport();
mockRouteReportID.current = defaultReport.reportID;

const defaultProps: ReportActionComposeProps = {
    reportID: defaultReport.reportID,
};

const commentAction: ReportActionItemMessageEditProps['action'] = {
    ...LHNTestUtils.getFakeReportAction(),
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
};

const testIds = CONST.COMPOSER.TEST_ID;

function ReportActionEditMessageContextProviderForReport({children}: PropsWithChildren) {
    return <ReportActionEditMessageContextProvider reportID={defaultReport.reportID}>{children}</ReportActionEditMessageContextProvider>;
}

function ReportScreenProviders({children}: PropsWithChildren) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, KeyboardStateProvider, ReportActionEditMessageContextProviderForReport]}>{children}</ComposeProviders>;
}

/**
 * Simulates the product split: on wide, inline @ReportActionItemMessageEdit is mounted (isEditingInline in PureReportActionItem);
 * on narrow it is not and edit happens in the main composer.
 */
type LayoutMode = 'narrow' | 'wide';
function MessageEditLayoutHost({layout}: {layout: LayoutMode}) {
    const isWide = layout === 'wide';
    return (
        <ReportScreenProviders>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            />
            {isWide && (
                <ReportActionItemMessageEdit
                    action={commentAction}
                    reportID={defaultReport.reportID}
                    originalReportID={defaultReport.reportID}
                    index={0}
                    isGroupPolicyReport={false}
                />
            )}
        </ReportScreenProviders>
    );
}

async function seedReportAndActions() {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${defaultReport.reportID}`, defaultReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${defaultReport.reportID}`, {
            [commentAction.reportActionID]: commentAction,
        });
    });
}

async function setReportActionDraftWithMessage(message: string) {
    await act(async () => {
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS, {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${defaultReport.reportID}`]: {
                [commentAction.reportActionID]: {message},
            },
        });
    });
}

async function clearReportActionDraftsForReport() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${defaultReport.reportID}`, {});
    });
}

function renderNarrowMessageCompose() {
    mockUseResponsiveLayout.mockReturnValue(narrowLayout);
    return render(
        <ReportScreenProviders>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            />
        </ReportScreenProviders>,
    );
}

describe('ReportActionMessageEdit layout and draft (narrow vs wide)', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        mockUseResponsiveLayout.mockReturnValue(narrowLayout);
        jest.useFakeTimers();
    });

    afterEach(async () => {
        jest.useRealTimers();
        await act(async () => {
            await Onyx.clear();
        });
        draftMessageVideoAttributeCache.clear();
    });

    it('with no report-action draft, main composer is in normal draft message mode (not message-edit action row)', async () => {
        await seedReportAndActions();
        await waitForBatchedUpdatesWithAct();

        renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(screen.queryByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeNull();
    });

    it('when a report-action draft is set on narrow, main composer enters message edit mode and edit-mode test IDs are used', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Narrow body');
        await waitForBatchedUpdatesWithAct();

        renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(screen.queryByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeNull();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_MAIN_COMPOSER)).toBeOnTheScreen();
        const mainCompose = screen.getByTestId(testIds.REPORT_ACTION_COMPOSE);
        expect(within(mainCompose).getByTestId(CONST.COMPOSER.NATIVE_ID).props.value).toBe('Narrow body');
    });

    it('when the draft is cleared, message edit mode ends and normal draft action row returns', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Then remove');
        await waitForBatchedUpdatesWithAct();

        const {unmount} = renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeOnTheScreen();

        await clearReportActionDraftsForReport();
        await waitForBatchedUpdatesWithAct();

        unmount();
        renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(screen.queryByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeNull();
    });

    it('on wide, main composer stays in normal action row while the inline @ReportActionItemMessageEdit is used', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Wide inline');
        await waitForBatchedUpdatesWithAct();

        mockUseResponsiveLayout.mockReturnValue(wideLayout);
        render(<MessageEditLayoutHost layout="wide" />);
        await waitForBatchedUpdatesWithAct();

        const mainRoot = screen.getByTestId(testIds.REPORT_ACTION_COMPOSE);
        expect(within(mainRoot).getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(within(mainRoot).queryByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeNull();

        expect(screen.getByTestId(testIds.REPORT_ACTION_ITEM_MESSAGE_EDIT)).toBeOnTheScreen();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_INLINE)).toBeOnTheScreen();
        expect(screen.queryByTestId(testIds.MESSAGE_EDIT_CANCEL_MAIN_COMPOSER)).toBeNull();
    });

    it('switches the editing surface from inline (wide) to main composer (narrow) when layout becomes narrow', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Shared draft');
        await waitForBatchedUpdatesWithAct();

        mockUseResponsiveLayout.mockReturnValue(wideLayout);
        const {unmount} = render(
            <MessageEditLayoutHost
                key="msg-edit-layout-1"
                layout="wide"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(testIds.REPORT_ACTION_ITEM_MESSAGE_EDIT)).toBeOnTheScreen();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_INLINE)).toBeOnTheScreen();
        const mainWide = screen.getByTestId(testIds.REPORT_ACTION_COMPOSE);
        expect(within(mainWide).getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();

        unmount();
        mockUseResponsiveLayout.mockReturnValue(narrowLayout);
        render(
            <MessageEditLayoutHost
                key="msg-edit-layout-2"
                layout="narrow"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId(testIds.REPORT_ACTION_ITEM_MESSAGE_EDIT)).toBeNull();
        expect(screen.queryByTestId(testIds.MESSAGE_EDIT_CANCEL_INLINE)).toBeNull();
        expect(screen.getByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_MAIN_COMPOSER)).toBeOnTheScreen();
    });

    it('switches the editing surface from main composer (narrow) to inline (wide) when layout becomes wide', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Back to wide');
        await waitForBatchedUpdatesWithAct();

        mockUseResponsiveLayout.mockReturnValue(narrowLayout);
        const {unmount} = render(
            <MessageEditLayoutHost
                key="msg-edit-layout-3"
                layout="narrow"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_MAIN_COMPOSER)).toBeOnTheScreen();
        expect(screen.queryByTestId(testIds.REPORT_ACTION_ITEM_MESSAGE_EDIT)).toBeNull();

        unmount();
        mockUseResponsiveLayout.mockReturnValue(wideLayout);
        render(
            <MessageEditLayoutHost
                key="msg-edit-layout-4"
                layout="wide"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        const main = screen.getByTestId(testIds.REPORT_ACTION_COMPOSE);
        expect(within(main).getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        expect(within(main).queryByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeNull();
        expect(screen.getByTestId(testIds.REPORT_ACTION_ITEM_MESSAGE_EDIT)).toBeOnTheScreen();
        expect(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_INLINE)).toBeOnTheScreen();
    });

    it('in narrow message-edit-in-composer mode, updateComment keeps the main composer value in sync (editingState + shouldUseNarrowLayout branch in ComposerWithSuggestions)', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Start');
        await waitForBatchedUpdatesWithAct();

        mockUseResponsiveLayout.mockReturnValue(narrowLayout);
        renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();

        const mainRoot = screen.getByTestId(testIds.REPORT_ACTION_COMPOSE);
        const composer = within(mainRoot).getByTestId(CONST.COMPOSER.NATIVE_ID);
        expect(screen.getByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeOnTheScreen();

        fireEvent.changeText(composer, 'Start, edited');
        await waitFor(() => {
            expect(within(mainRoot).getByTestId(CONST.COMPOSER.NATIVE_ID).props.value).toBe('Start, edited');
        });
    });

    it('cancel in narrow main composer returns to normal draft action row', async () => {
        await seedReportAndActions();
        await setReportActionDraftWithMessage('Cancel me');
        await waitForBatchedUpdatesWithAct();

        renderNarrowMessageCompose();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId(testIds.MESSAGE_EDIT_CANCEL_MAIN_COMPOSER));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(testIds.DRAFT_MESSAGE_ACTION_ROW)).toBeOnTheScreen();
        });
        expect(screen.queryByTestId(testIds.EDITING_MESSAGE_ACTION_ROW)).toBeNull();
    });
});
