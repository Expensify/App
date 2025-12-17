import React, {useMemo} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@userActions/Report';
import {requestTaxExempt} from '@userActions/Subscription';
import CONST from '@src/CONST';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function TaxExemptActions() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
        <View style={[styles.mtn2, styles.pAbsolute, styles.rn3]}>
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={overflowMenu}
                anchorAlignment={anchorAlignment}
                shouldOverlay
            />
        </View>
    );
}

export default TaxExemptActions;
