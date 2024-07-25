import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {AnchorPosition} from '@styles/index';
import * as Report from '@userActions/Report';
import * as Subscription from '@userActions/Subscription';
import CONST from '@src/CONST';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function TaxExemptActions() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef<View>(null);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Coins,
                text: translate('subscription.details.taxExempt'),
                onSelected: () => {
                    Subscription.requestSubscriptionTaxExempt();
                    Report.navigateToConciergeChat();
                },
            },
        ],
        [translate],
    );

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => {
        if (isSmallScreenWidth) {
            return;
        }
        threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
            setThreeDotsMenuPosition({
                horizontal: x + width,
                vertical: y + height,
            });
        });
    }, [isSmallScreenWidth]);

    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[styles.mtn2, styles.pAbsolute, styles.rn3]}
        >
            <ThreeDotsMenu
                onIconPress={calculateAndSetThreeDotsMenuPosition}
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
