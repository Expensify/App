import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import MoneyRequestHeaderPrimaryAction from './MoneyRequestHeaderPrimaryAction';
import MoneyRequestHeaderSecondaryActions from './MoneyRequestHeaderSecondaryActions';
import {useWideRHPState} from './WideRHPContextProvider';

type MoneyRequestHeaderActionsProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean) => void;
};

function MoneyRequestHeaderActions({reportID, onBackButtonPress}: MoneyRequestHeaderActionsProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useWideRHPState();
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
    >();

    const isNarrow = !shouldUseNarrowLayout || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);
    const shouldDisplayTransactionNavigation = !!(reportID && route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT);

    return (
        <View
            style={
                isNarrow
                    ? [styles.flexRow, styles.gap2, shouldDisplayTransactionNavigation && styles.mr3]
                    : [styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]
            }
        >
            <MoneyRequestHeaderPrimaryAction reportID={reportID} />
            <MoneyRequestHeaderSecondaryActions
                reportID={reportID}
                onBackButtonPress={onBackButtonPress}
            />
        </View>
    );
}

MoneyRequestHeaderActions.displayName = 'MoneyRequestHeaderActions';

export default MoneyRequestHeaderActions;
