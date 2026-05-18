import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ThreeDotsMenuHandle = {hidePopoverMenu: () => void; isPopupMenuVisible: boolean};

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    hideProductTrainingTooltip?: () => void;
    renderTooltipContent: () => React.JSX.Element;
    shouldRenderTooltip: boolean;
    isCopied?: boolean;
};

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, hideProductTrainingTooltip, renderTooltipContent, shouldRenderTooltip, isCopied}: SavedSearchItemThreeDotMenuProps) {
    const styles = useThemeStyles();
    const threeDotsMenuRef = useRef<ThreeDotsMenuHandle | null>(null);

    useEffect(() => {
        if (!isCopied) {
            return;
        }
        const timer = setTimeout(() => {
            threeDotsMenuRef.current?.hidePopoverMenu();
        }, MENU_CLOSE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isCopied]);

    return (
        <View style={[isDisabledItem && styles.pointerEventsNone]}>
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={menuItems}
                renderProductTrainingTooltipContent={renderTooltipContent}
                shouldShowProductTrainingTooltip={shouldRenderTooltip}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                iconStyles={styles.wAuto}
                hideProductTrainingTooltip={hideProductTrainingTooltip}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_THREE_DOT_MENU}
                threeDotsMenuRef={threeDotsMenuRef}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
