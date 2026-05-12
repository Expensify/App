import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {ComposerRef, TextSelection} from '@components/Composer/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as ComposerContext from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import type {ComposerEditState} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import ReportActionComposeUtils from '@pages/inbox/report/ReportActionCompose/ReportActionComposeUtils';
import useEditComposerToggle from '@pages/inbox/report/ReportActionCompose/useEditComposerToggle';

jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ReportActionCompose/ComposerContext');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
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
        editingState: 'off',
        isEditingInComposer: false,
        editingReportID: null,
        editingReportActionID: null,
        editingReportAction: null,
        editingMessage: null,
        currentEditMessageSelection: null,
        effectiveDraft: undefined,
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
        mockUseResponsiveLayout.mockReturnValue(narrowLayoutResult());
    });

    it('does not run apply logic while editingState is submitted', () => {
        const onValueChange = jest.fn();
        const composerRef = makeComposerRef();
        composerEditStateRef.current = defaultComposerEditState({editingState: 'submitted', editingMessage: 'hello'});

        renderHook(() =>
            useEditComposerToggle({
                selection: {start: 0, end: 0},
                draftComment: 'draft',
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
            (props: {selection: TextSelection; draft: string}) =>
                useEditComposerToggle({
                    selection: props.selection,
                    draftComment: props.draft,
                    composerRef,
                    onValueChange,
                    onSelectionChange,
                    onFocus,
                }),
            {initialProps: {selection: priorSelection, draft: 'keep my draft'}},
        );

        composerEditStateRef.current = defaultComposerEditState({
            editingState: 'editing',
            editingMessage: 'edited body',
            editingReportActionID: '100',
            currentEditMessageSelection: {start: 1, end: 2},
        });
        rerender({selection: priorSelection, draft: 'keep my draft'});

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
                draftComment: 'draft in composer',
                composerRef,
                onValueChange,
            }),
        );

        composerEditStateRef.current = defaultComposerEditState({
            editingState: 'editing',
            editingMessage: 'from thread',
        });
        rerender({});

        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('on narrow, when edit ends, restores prior draft and selection; blurs if composer was not focused before', () => {
        const onValueChange = jest.fn();
        const onSelectionChange = jest.fn();
        const composerRef = makeComposerRef();
        const priorSelection: TextSelection = {start: 2, end: 5};

        // Start with edit off so wasEditingRef is false; then turn editing on to capture previousDraftSelectionRef.
        const {rerender} = renderHook(
            (props: {selection: TextSelection; draft: string; editing: boolean}) => {
                composerEditStateRef.current = defaultComposerEditState(props.editing ? {editingState: 'editing', editingMessage: 'e', editingReportActionID: '1'} : {editingState: 'off'});
                return useEditComposerToggle({
                    selection: props.selection,
                    draftComment: props.draft,
                    composerRef,
                    onValueChange,
                    onSelectionChange,
                });
            },
            {initialProps: {selection: priorSelection, draft: 'restored', editing: false}},
        );

        rerender({selection: priorSelection, draft: 'restored', editing: true});

        onValueChange.mockClear();
        onSelectionChange.mockClear();

        rerender({selection: priorSelection, draft: 'restored', editing: false});

        expect(onValueChange).toHaveBeenCalledWith('restored');
        expect(onSelectionChange).toHaveBeenCalledWith(priorSelection);
        expect(composerRef.current?.blur).toHaveBeenCalled();
    });

    it('on narrow, when switching the message being edited, applies the new message', () => {
        const onValueChange = jest.fn();
        const onFocus = jest.fn();
        const composerRef = makeComposerRef();

        composerEditStateRef.current = defaultComposerEditState({
            editingState: 'editing',
            editingMessage: 'first',
            editingReportActionID: 'a',
        });

        const {rerender} = renderHook(
            (id: string) => {
                composerEditStateRef.current = defaultComposerEditState({
                    editingState: 'editing',
                    editingMessage: id === 'a' ? 'first' : 'second',
                    editingReportActionID: id,
                });
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    draftComment: 'x',
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
            editingState: 'editing',
            editingMessage: 'wide first',
        });

        const {rerender} = renderHook(() =>
            useEditComposerToggle({
                selection: {start: 0, end: 0},
                draftComment: 'composer draft',
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
            editingState: 'editing',
            editingMessage: 'editing in narrow',
        });

        const {rerender} = renderHook(
            (narrow: boolean) => {
                mockUseResponsiveLayout.mockReturnValue(narrow ? narrowLayoutResult() : wideLayoutResult());
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    draftComment: 'plain draft for wide',
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
                composerEditStateRef.current = defaultComposerEditState(editing ? {editingState: 'editing', editingMessage: 'hi', editingReportActionID: '1'} : {editingState: 'off'});
                return useEditComposerToggle({
                    selection: {start: 0, end: 0},
                    draftComment: 'd',
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
