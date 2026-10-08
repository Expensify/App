import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {GestureResponderEvent} from 'react-native';

import React, {useContext, useState} from 'react';
import {View} from 'react-native';

import type {SwipeableRowAction, SwipeableRowProps} from './types';

import ActionsPanel from './ActionsPanel';
import {SIDE} from './const';
import SwipeableListContext from './SwipeableListContext';

/**
 * A list row with swipe actions on either side, like Mail. A short swipe reveals the actions, a full swipe runs the
 * first one, and dragging back cancels. The gesture lives in SwipeableList, one per list; a row only reports that it
 * was touched and, while swiped or open, borrows the list's offset. Only for native; on web the row renders as is.
 */
function SwipeableRow({getActions, isDisabled = false, rowKey, children}: SwipeableRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const swipeableListContext = useContext(SwipeableListContext);
    const [isActive, setIsActive] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // FlashList recycles cells, so a cell reused for another row must not keep the swipe
    const [prevRowKey, setPrevRowKey] = useState(rowKey);
    if (prevRowKey !== rowKey) {
        setPrevRowKey(rowKey);
        setIsActive(false);
        setIsOpen(false);
    }

    const canSwipe = !!swipeableListContext && !isDisabled && !!rowKey && !!getActions;

    // Built only while the row is swiped or open
    const actions = isActive ? getActions?.() : undefined;
    const leadingActions = actions?.leading ?? [];
    const trailingActions = actions?.trailing ?? [];

    const registerTouch = () => {
        const touchedActions = getActions?.();
        swipeableListContext?.registerTouch({
            key: rowKey ?? '',
            leadingActionCount: touchedActions?.leading.length ?? 0,
            trailingActionCount: touchedActions?.trailing.length ?? 0,
            activate: () => setIsActive(true),
            deactivate: () => {
                setIsActive(false);
                setIsOpen(false);
            },
            setIsOpen,
            runPrimaryAction: (side) => {
                const latestActions = getActions?.();
                const action = side === SIDE.LEADING ? latestActions?.leading.at(0) : latestActions?.trailing.at(0);
                action?.onPress();
            },
        });
    };

    const pressAction = (action: SwipeableRowAction, event?: GestureResponderEvent) => {
        action.onPress(event);
        swipeableListContext?.closeActiveRow();
    };

    return (
        <View onTouchStart={canSwipe ? registerTouch : undefined}>
            {isActive && !!swipeableListContext && leadingActions.length > 0 && (
                <ActionsPanel
                    actions={leadingActions}
                    isLeading
                    isOpen={isOpen}
                    translateX={swipeableListContext.translateX}
                    armedProgress={swipeableListContext.armedProgress}
                    popScale={swipeableListContext.popScale}
                    onPress={pressAction}
                />
            )}
            {isActive && !!swipeableListContext && trailingActions.length > 0 && (
                <ActionsPanel
                    actions={trailingActions}
                    isLeading={false}
                    isOpen={isOpen}
                    translateX={swipeableListContext.translateX}
                    armedProgress={swipeableListContext.armedProgress}
                    popScale={swipeableListContext.popScale}
                    onPress={pressAction}
                />
            )}
            <View ref={isActive ? swipeableListContext?.attachActiveRow : undefined}>
                {children}
                {isOpen && (
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.close')}
                        role={CONST.ROLE.BUTTON}
                        onPress={() => swipeableListContext?.closeActiveRow()}
                        style={styles.swipeableRowCloseOverlay}
                        sentryLabel={CONST.SENTRY_LABEL.SWIPEABLE_ROW.CLOSE}
                    />
                )}
            </View>
        </View>
    );
}

function SwipeableRowDisabled({children}: SwipeableRowProps) {
    return children;
}

// Picked once at load, so the POC switch adds no component layer to every row
/** With the POC switch off, rows render exactly as without swipe actions. */
export default CONST.IS_INBOX_SWIPE_ACTIONS_ENABLED ? SwipeableRow : SwipeableRowDisabled;
