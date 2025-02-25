import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import type {LayoutChangeEventWithTarget} from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AnchorPosition} from '@styles/index';
import {navigateToConciergeChat} from '@userActions/Report';
import {requestTaxExempt} from '@userActions/Subscription';
import CONST from '@src/CONST';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function TaxExemptActions() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef<View>(null);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Coins,
                numberOfLinesTitle: 2,
                text: translate('subscription.details.taxExempt'),
                onSelected: () => {
                    requestTaxExempt();
                    navigateToConciergeChat();
                },
            },
        ],
        [translate],
    );

    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[styles.mtn2, styles.pAbsolute, styles.rn3]}
            onLayout={(e: LayoutChangeEvent) => {
                if (shouldUseNarrowLayout) {
                    return;
                }
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
                menuItems={overflowMenu}
                anchorPosition={threeDotsMenuPosition}
                anchorAlignment={anchorAlignment}
                shouldOverlay
            />
        </View>
    );
}

TaxExemptActions.displayName = 'TaxExemptActions';

export default TaxExemptActions;
