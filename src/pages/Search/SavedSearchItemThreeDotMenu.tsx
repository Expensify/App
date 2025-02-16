import React, {useRef, useState} from 'react';
import type {LayoutChangeEvent, LayoutRectangle, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    hideProductTrainingTooltip?: () => void;
    renderTooltipContent: () => React.JSX.Element;
    shouldRenderTooltip: boolean;
};

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, hideProductTrainingTooltip, renderTooltipContent, shouldRenderTooltip}: SavedSearchItemThreeDotMenuProps) {
    const threeDotsMenuContainerRef = useRef<View>(null);
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState({horizontal: 0, vertical: 0});
    const styles = useThemeStyles();
    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[isDisabledItem && styles.pointerEventsNone]}
            onLayout={(e: LayoutChangeEvent) => {
                const target = e.target || (e as LayoutChangeEventWithTarget).nativeEvent.target;
                target?.measureInWindow((x, y, width) => {
                    setThreeDotsMenuPosition({
                        horizontal: x + width,
                        vertical: y,
                    });
                });
            }}
        >
            <ThreeDotsMenu
                menuItems={menuItems}
                anchorPosition={threeDotsMenuPosition}
                renderProductTrainingTooltipContent={renderTooltipContent}
                shouldShowProductTrainingTooltip={shouldRenderTooltip}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                iconStyles={styles.wAuto}
                hideProductTrainingTooltip={hideProductTrainingTooltip}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
