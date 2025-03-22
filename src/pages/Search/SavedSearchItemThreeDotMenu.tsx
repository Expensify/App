import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    hideProductTrainingTooltip?: () => void;
    renderTooltipContent: () => React.JSX.Element;
    shouldRenderTooltip: boolean;
};

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, hideProductTrainingTooltip, renderTooltipContent, shouldRenderTooltip}: SavedSearchItemThreeDotMenuProps) {
    const threeDotsMenuContainerRef = useRef<View>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }
        return new Promise<AnchorPosition>((resolve) => {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width) => {
                resolve({
                    horizontal: x + width,
                    vertical: y,
                });
            });
        });
    }, [shouldUseNarrowLayout]);

    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[isDisabledItem && styles.pointerEventsNone]}
        >
            <ThreeDotsMenu
                menuItems={menuItems}
                getAnchorPosition={calculateAndSetThreeDotsMenuPosition}
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
