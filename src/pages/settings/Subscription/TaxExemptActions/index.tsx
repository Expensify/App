import React, {useMemo} from 'react';
import {View} from 'react-native';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@userActions/Report';
import {requestTaxExempt} from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function TaxExemptActions() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: icons.Coins,
                numberOfLinesTitle: 2,
                text: translate('subscription.details.taxExempt'),
                onSelected: () => {
                    requestTaxExempt();
                    navigateToConciergeChat(conciergeReportID, false);
                },
            },
        ],
        [translate, icons.Coins, conciergeReportID],
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
