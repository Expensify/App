import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AnchorPosition} from '@styles/index';
import {navigateToConciergeChat} from '@userActions/Report';
import {requestTaxExempt} from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function TaxExemptActions() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const threeDotsMenuContainerRef = useRef<View>(null);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Coins,
                numberOfLinesTitle: 2,
                text: translate('subscription.details.taxExempt'),
                onSelected: () => {
                    requestTaxExempt();
                    navigateToConciergeChat(reportNameValuePairs);
                },
            },
        ],
        [translate],
    );

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }
        return new Promise<AnchorPosition>((resolve) => {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);

    return (
        <View
            ref={threeDotsMenuContainerRef}
            style={[styles.mtn2, styles.pAbsolute, styles.rn3]}
        >
            <ThreeDotsMenu
                getAnchorPosition={calculateAndSetThreeDotsMenuPosition}
                menuItems={overflowMenu}
                anchorAlignment={anchorAlignment}
                shouldOverlay
            />
        </View>
    );
}

TaxExemptActions.displayName = 'TaxExemptActions';

export default TaxExemptActions;
