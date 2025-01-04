import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    hideProductTrainingTooltip?: () => void;
};

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, hideProductTrainingTooltip}: SavedSearchItemThreeDotMenuProps) {
    const threeDotsMenuContainerRef = useRef<View>(null);
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState({horizontal: 0, vertical: 0});
    const styles = useThemeStyles();
    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[isDisabledItem && styles.pointerEventsNone]}
        >
            <ThreeDotsMenu
                menuItems={menuItems}
                onIconPress={() => {
                    hideProductTrainingTooltip?.();
                    threeDotsMenuContainerRef.current?.measureInWindow((x, y, width) => {
                        setThreeDotsMenuPosition({
                            horizontal: x + width,
                            vertical: y,
                        });
                    });
                }}
                anchorPosition={threeDotsMenuPosition}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                iconStyles={styles.wAuto}
                // We need to hide the extra "More" tooltip when we have an educational tooltip
                shouldHideExtraTooltip={!!hideProductTrainingTooltip}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
