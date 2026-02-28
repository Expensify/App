import type {ReactNode} from 'react';
import {createContext, useContext} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';
import type {ActionId} from './actions/actionConfig';
import {ORDERED_ACTION_SHOULD_SHOW} from './actions/actionConfig';
import {useContextMenuPayload} from './ContextMenuPayloadProvider';

type ContextMenuVisibilityContextValue = {
    visibleActionIds: ActionId[];
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
};

const ContextMenuVisibilityContext = createContext<ContextMenuVisibilityContextValue>({
    visibleActionIds: [],
    focusedIndex: -1,
    setFocusedIndex: () => {},
});

function useContextMenuVisibility(): ContextMenuVisibilityContextValue {
    return useContext(ContextMenuVisibilityContext);
}

type ContextMenuLayoutProps = {
    isMini: boolean;
    isVisible: boolean;
    shouldKeepOpen: boolean;
    contentRef?: React.RefObject<View | null>;
    children: ReactNode;
};

function ContextMenuLayout({isMini, isVisible, shouldKeepOpen, contentRef, children}: ContextMenuLayoutProps) {
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const payload = useContextMenuPayload();

    const shouldShowArgs = {
        type: payload.type,
        reportAction: payload.reportAction,
        childReportActions: payload.childReportActions,
        isArchivedRoom: payload.isArchivedRoom,
        betas: payload.betas,
        menuTarget: payload.anchor,
        isChronosReport: payload.isChronosReport,
        reportID: payload.reportID,
        isPinnedChat: payload.isPinnedChat,
        isUnreadChat: payload.isUnreadChat,
        isThreadReportParentAction: payload.isThreadReportParentAction,
        isOffline: payload.isOffline,
        isMini,
        isProduction: payload.isProduction,
        moneyRequestAction: payload.moneyRequestAction,
        areHoldRequirementsMet: payload.areHoldRequirementsMet,
        isDebugModeEnabled: payload.isDebugModeEnabled,
        iouTransaction: payload.iouTransaction,
        transactions: payload.transactions,
        moneyRequestReport: payload.moneyRequestReport,
        moneyRequestPolicy: payload.moneyRequestPolicy,
        isHarvestReport: payload.isHarvestReport,
    };

    let visibleActionIds = ORDERED_ACTION_SHOULD_SHOW.filter((entry) => !payload.disabledActionIds.has(entry.id) && entry.shouldShow(shouldShowArgs)).map((entry) => entry.id);

    if (isMini) {
        const overflowMenuId = visibleActionIds.at(-1);
        const otherIds = visibleActionIds.slice(0, -1);
        if (otherIds.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS && overflowMenuId) {
            visibleActionIds = [...otherIds.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1), overflowMenuId];
        } else {
            visibleActionIds = otherIds;
        }
    }

    const contentActionIndexes = visibleActionIds
        .map((id, index) => {
            const entry = ORDERED_ACTION_SHOULD_SHOW.find((e) => e.id === id);
            return entry?.isContentAction ? index : undefined;
        })
        .filter((index): index is number => index !== undefined);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: contentActionIndexes,
        maxIndex: visibleActionIds.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);

    const contextValue: ContextMenuVisibilityContextValue = {
        visibleActionIds,
        focusedIndex,
        setFocusedIndex,
    };

    return (
        (isVisible || shouldKeepOpen || !isMini) && (
            <ContextMenuVisibilityContext.Provider value={contextValue}>
                <FocusTrapForModal active={!isMini && !isSmallScreenWidth && (isVisible || shouldKeepOpen)}>
                    <View
                        ref={contentRef}
                        style={wrapperStyle}
                    >
                        {children}
                    </View>
                </FocusTrapForModal>
            </ContextMenuVisibilityContext.Provider>
        )
    );
}

export default ContextMenuLayout;
export {useContextMenuVisibility};
