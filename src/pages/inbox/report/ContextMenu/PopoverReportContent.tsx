import React, {useMemo} from 'react';
import {View} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {ActionID} from './actions/actionConfig';
import type {ActionDescriptor} from './actions/ActionDescriptor';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import type {ContextMenuPayload} from './actions/actionTypes';
import {createCopyOnyxDataAction, createDebugAction, createMarkAsReadAction, createMarkAsUnreadAction, createPinAction, createUnpinAction} from './actions/ContextMenuAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import useReportContextMenuData from './useReportContextMenuData';

function PopoverReportContent({menuState, hideAndRun, setLocalShouldKeepOpen, transitionActionSheetState, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

    const data = useReportContextMenuData({
        reportID: menuState.reportID,
        reportActionID: menuState.reportActionID,
        originalReportID: menuState.originalReportID,
        draftMessage: menuState.draftMessage ?? '',
        selection: menuState.selection ?? '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT,
        anchor: {current: menuState.contextMenuTargetNode ?? null},
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const payload = {
        ...data,
        reportAction: data.reportAction as NonNullable<ContextMenuPayload['reportAction']>,
        currentUserAccountID: 0,
        currentUserPersonalDetails: undefined as unknown as ContextMenuPayload['currentUserPersonalDetails'],
        encryptedAuthToken: '',
        childReport: undefined,
        childReportActions: undefined,
        policy: undefined,
        policyTags: undefined,
        moneyRequestAction: undefined,
        moneyRequestReport: undefined,
        moneyRequestPolicy: undefined,
        iouTransaction: undefined,
        transaction: undefined,
        card: undefined,
        isThreadReportParentAction: false,
        isHarvestReport: false,
        isTryNewDotNVPDismissed: false,
        isDelegateAccessRestricted: false,
        areHoldRequirementsMet: false,
        betas: undefined,
        transactions: undefined,
        introSelected: undefined,
        movedFromReport: undefined,
        movedToReport: undefined,
        harvestReport: undefined,
        download: undefined,
        close: () => setLocalShouldKeepOpen(false),
        hideAndRun,
        transitionActionSheetState,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        openOverflowMenu: () => {},
        setIsEmojiPickerActive: undefined,
        showDelegateNoAccessModal: undefined,
    } satisfies ContextMenuPayload;

    const params = {payload, icons};

    const allActions: ActionDescriptor[] = [
        createMarkAsReadAction(params),
        createMarkAsUnreadAction(params),
        createPinAction(params),
        createUnpinAction(params),
        createCopyOnyxDataAction(params),
        createDebugAction(params),
    ];

    const actions = allActions.filter((action) => visibleActionIDs.has(action.id as ActionID));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: actions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            {actions.map((action: ActionDescriptor, i: number) => (
                <FocusableMenuItem
                    key={action.id}
                    title={action.text}
                    icon={action.icon}
                    onPress={action.onPress}
                    wrapperStyle={[styles.pr8]}
                    description={action.description ?? ''}
                    descriptionTextStyle={styles.breakWord}
                    style={StyleUtils.getContextMenuItemStyles(windowWidth)}
                    isAnonymousAction={action.isAnonymousAction}
                    focused={focusedIndex === i}
                    interactive
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => (i === actions.length - 1 || i === 1) && setFocusedIndex(-1)}
                    disabled={action.disabled}
                    shouldShowLoadingSpinnerIcon={action.shouldShowLoadingSpinnerIcon}
                    sentryLabel={action.sentryLabel}
                />
            ))}
        </View>
    );
}

export default PopoverReportContent;
