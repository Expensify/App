import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {ComposerRef, TextSelection} from '@components/Composer/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as ComposerContext from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import type {ComposerActions, ComposerEditState} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import ReportActionComposeUtils from '@pages/inbox/report/ReportActionCompose/ReportActionComposeUtils';
import useEditComposerToggle from '@pages/inbox/report/ReportActionCompose/useEditComposerToggle';
import type {ReportActionEditMessageState} from '@pages/inbox/report/ReportActionEditMessageContext';
import CONST from '@src/CONST';

jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ReportActionCompose/ComposerContext');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useComposerActions: jest.fn(),
        useComposerEditActions: jest.fn(),
        useComposerEditState: jest.fn(),
    };
});

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@pages/inbox/report/ReportActionCompose/ReportActionComposeUtils', () => ({
    __esModule: true,
    default: {
        updateNativeSelectionValue: jest.fn(),
    },
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

const mockUseComposerEditState = jest.mocked(ComposerContext.useComposerEditState);
const mockUseComposerActions = jest.mocked(ComposerContext.useComposerActions);
const mockUseComposerEditActions = jest.mocked(ComposerContext.useComposerEditActions);
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUpdateNativeSelectionValue = jest.mocked(ReportActionComposeUtils.updateNativeSelectionValue);

function makeComposerRef(overrides?: Partial<ComposerRef>): RefObject<ComposerRef | null> {
    return {
        current: {
            blur: jest.fn(),
            isFocused: jest.fn(() => false),
            setNativeProps: jest.fn(),
            setSelection: jest.fn(),
            focus: jest.fn(),
            ...overrides,
        } as unknown as ComposerRef,
    };
}

function defaultComposerEditState(overrides?: Partial<ComposerEditState>): ComposerEditState {
    return {
        editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF,
        isEditingInComposer: false,
        editingReportID: null,
        editingReportActionID: null,
        editingReportAction: null,
        editingMessage: null,
        currentEditMessageSelection: null,
        draftComment: undefined,
        effectiveDraft: undefined,
        didResetComposerHeightWhileEditing: false,
        ...overrides,
    };
}

function defaultComposerActions(overrides?: Partial<ComposerActions>): ComposerActions {
    return {
        setText: jest.fn(),
        setMenuVisibility: jest.fn(),
        setIsFullComposerAvailable: jest.fn(),
        setComposerRef: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        onAddActionPressed: jest.fn(),
        onItemSelected: jest.fn(),
        onTriggerAttachmentPicker: jest.fn(),
        clearComposer: jest.fn(),
        ...overrides,
    };
}

type MockComposerEditActions = {
    publishDraft: (draftMessage: string) => void;
    deleteDraft: () => void;
    setDidResetComposerHeightWhileEditing: (value: boolean) => void;
};

function defaultComposerEditActions(overrides?: Partial<MockComposerEditActions>): MockComposerEditActions {
    return {
        publishDraft: jest.fn(),
        deleteDraft: jest.fn(),
        setDidResetComposerHeightWhileEditing: jest.fn(),
        ...overrides,
    };
}

function wideLayoutResult(): ResponsiveLayoutResult {
    return {
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isExtraSmallScreenWidth: false,
        isMediumScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: true,
        isLargeScreenWidth: true,
        isExtraLargeScreenWidth: false,
        isSmallScreen: false,
        isInLandscapeMode: false,
    };
}

function narrowLayoutResult(): ResponsiveLayoutResult {
    return {
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isExtraSmallScreenWidth: false,
        isMediumScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: false,
        isLargeScreenWidth: false,
        isExtraLargeScreenWidth: false,
        isSmallScreen: true,
        isInLandscapeMode: false,
    };
}

describe('useEditComposerToggle', () => {
    const composerEditStateRef = {current: defaultComposerEditState()};

    beforeEach(() => {
        jest.clearAllMocks();
        composerEditStateRef.current = defaultComposerEditState();
        mockUseComposerEditState.mockImplementation(() => composerEditStateRef.current);
        mockUseComposerActions.mockReturnValue(defaultComposerActions());
        mockUseComposerEditActions.mockReturnValue(defaultComposerEditActions());
        mockUseResponsiveLayout.mockReturnValue(narrowLayoutResult());
    });

    it('does not run apply logic while editingState is submitted', () => {
        const onValueChange = jest.fn();
        const composerRef = makeComposerRef();
        composerEditStateRef.current = defaultComposerEditState({editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED, editingMessage: 'hello'});

        renderHook(() =>
            useEditComposerToggle({
                selection: {start: 0, end: 0},
                composerRef,
                onValueChange,
            }),
        );

        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('on narrow layout, when editing starts, applies editing message, selection at end, and focus', () => {
        const onValueChange = jest.fn();
        const onSelectionChange = jest.fn();
        const onFocus = jest.fn();
        const composerRef = makeComposerRef();
        const priorSelection: TextSelection = {start: 0, end: 0};

        const {rerender} = renderHook(
            (props: {selection: TextSelection; value: string}) =>
                useEditComposerToggle({
                    selection: props.selection,
                    composerRef,
                    onValueChange,
                    onSelectionChange,
                    onFocus,
                }),
            {initialProps: {selection: priorSelection, value: 'keep my draft'}},
        );

        composerEditStateRef.current = defaultComposerEditState({
            editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
            editingMessage: 'edited body',
            editingReportActionID: '100',
            currentEditMessageSelection: {start: 1, end: 2},
        });
        rerender({selection: priorSelection, value: 'keep my draft'});

        const expectedEnd = 'edited body'.length;
        expect(onValueChange).toHaveBeenCalledWith('edited body');
        expect(onSelectionChange).toHaveBeenCalledWith({start: expectedEnd, end: expectedEnd});
        expect(onFocus).toHaveBeenCalled();
    });

    it('on wide layout, when editing starts, leaves composer value unchanged (inline editor handles edit)', () => {
        mockUseResponsiveLayout.mockReturnValue(wideLayoutResult());

        const onValueChange = jest.fn();
        const composerRef = makeComposerRef();

        const {rerender} = renderHook(() =>
            useEditComposerToggle({
                selection: {start: 0, end: 0},
                composerRef,
                onValueChange,
            }),
        );

        composerEditStateRef.current = defaultComposerEditState({
            editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
            editingMessage: 'from thread',
        });
        rerender({});

        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('on narrow, when edit ends, restores prior draft and selection', () => {
        const onValueChange = jest.fn();
        const onSelectionChange = jest.fn();
        const composerRef = makeComposerRef();
        const priorSelection: TextSelection = {start: 2, end: 5};

        // Start with edit off so wasEditingRef is false; then turn editing on to capture previousDraftSelectionRef.
        const {rerender} = renderHook(
            (props: {selection: TextSelection; draftComment: string; editing: boolean}) => {
                composerEditStateRef.current = defaultComposerEditState(
                    props.editing
                        ? {editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING, editingMessage: 'e', editingReportActionID: '1', draftComment: props.draftComment}
                        : {editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF, draftComment: props.draftComment},
                );
                return useEditComposerToggle({
                    selection: props.selection,
                    composerRef,
                    onValueChange,
                    onSelectionChange,
                });
            },
            {initialProps: {selection: priorSelection, draftComment: 'restored', editing: false}},
        );

        rerender({selection: priorSelection, draftComment: 'restored', editing: true});

        onValueChange.mockClear();
        onSelectionChange.mockClear();

        rerender({selection: priorSelection, draftComment: 'restored', editing: false});

        expect(onValueChange).toHaveBeenCalledWith('restored');
        expect(onSelectionChange).toHaveBeenCalledWith(priorSelection);
        expect(composerRef.current?.blur).not.toHaveBeenCalled();
    });

    it('resets the manual composer height after a submitted narrow composer edit ends', () => {
        const setDidResetComposerHeight = jest.fn();
        const composerRef = makeComposerRef();
        mockUseComposerEditActions.mockReturnValue(defaultComposerEditActions({setDidResetComposerHeightWhileEditing: setDidResetComposerHeight}));

        const {rerender} = renderHook<void, ReportActionEditMessageState>(
            (editingState: ComposerEditState['editingState']) => {
                composerEditStateRef.current = defaultComposerEditState({
                    editingState,
                    isEditingInComposer: editingState === CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
                    editingMessage: 'edited message',
                    editingReportActionID: '1',
                });

                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    composerRef,
                });
            },
            {initialProps: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF},
        );

        rerender(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
        rerender(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED);
        rerender(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);

        expect(setDidResetComposerHeight).toHaveBeenCalledWith(false);
    });

    it('on narrow, when switching the message being edited, applies the new message', () => {
        const onValueChange = jest.fn();
        const onFocus = jest.fn();
        const composerRef = makeComposerRef();

        composerEditStateRef.current = defaultComposerEditState({
            editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
            editingMessage: 'first',
            editingReportActionID: 'a',
        });

        const {rerender} = renderHook(
            (id: string) => {
                composerEditStateRef.current = defaultComposerEditState({
                    editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
                    editingMessage: id === 'a' ? 'first' : 'second',
                    editingReportActionID: id,
                });
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    composerRef,
                    onValueChange,
                    onFocus,
                });
            },
            {initialProps: 'a'},
        );

        onValueChange.mockClear();
        onFocus.mockClear();

        rerender('b');

        expect(onValueChange).toHaveBeenCalledWith('second');
        expect(onFocus).toHaveBeenCalled();
    });

    it('when layout goes from wide to narrow while editing, loads editing message into the composer', () => {
        mockUseResponsiveLayout.mockReturnValue(wideLayoutResult());

        const onValueChange = jest.fn();
        const onFocus = jest.fn();
        const composerRef = makeComposerRef();

        composerEditStateRef.current = defaultComposerEditState({
            editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
            editingMessage: 'wide first',
        });

        const {rerender} = renderHook(() =>
            useEditComposerToggle({
                selection: {start: 0, end: 0},
                composerRef,
                onValueChange,
                onFocus,
            }),
        );

        onValueChange.mockClear();

        mockUseResponsiveLayout.mockReturnValue(narrowLayoutResult());
        rerender({});

        expect(onValueChange).toHaveBeenCalledWith('wide first');
        expect(onFocus).toHaveBeenCalled();
    });

    it('when layout goes from narrow to wide while editing, restores the normal draft in the composer', () => {
        const onValueChange = jest.fn();
        const composerRef = makeComposerRef();

        composerEditStateRef.current = defaultComposerEditState({
            editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING,
            editingMessage: 'editing in narrow',
            draftComment: 'plain draft for wide',
        });

        const {rerender} = renderHook(
            (narrow: boolean) => {
                mockUseResponsiveLayout.mockReturnValue(narrow ? narrowLayoutResult() : wideLayoutResult());
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    composerRef,
                    onValueChange,
                });
            },
            {initialProps: true},
        );

        onValueChange.mockClear();

        rerender(false);

        expect(onValueChange).toHaveBeenCalledWith('plain draft for wide');
    });

    it('passes selection through to ReportActionComposeUtils when toggling (non-iOS / web mock)', () => {
        const onValueChange = jest.fn();
        const onSelectionChange = jest.fn();
        const composerRef = makeComposerRef();

        const {rerender} = renderHook(
            (editing: boolean) => {
                composerEditStateRef.current = defaultComposerEditState(
                    editing
                        ? {editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING, editingMessage: 'hi', editingReportActionID: '1'}
                        : {editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF},
                );
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    composerRef,
                    onValueChange,
                    onSelectionChange,
                });
            },
            {initialProps: false},
        );

        rerender(true);

        expect(mockUpdateNativeSelectionValue).toHaveBeenCalled();
    });
});
