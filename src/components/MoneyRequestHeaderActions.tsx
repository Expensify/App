import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import MoneyRequestHeaderPrimaryAction from './MoneyRequestHeaderPrimaryAction';
import MoneyRequestHeaderSecondaryActions from './MoneyRequestHeaderSecondaryActions';

type MoneyRequestHeaderActionsProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean) => void;

    /** Whether the actions render inline in HeaderWithBackButton (narrow) or below it (wide) */
    isNarrow: boolean;
};

function MoneyRequestHeaderActions({reportID, onBackButtonPress, isNarrow}: MoneyRequestHeaderActionsProps) {
    const styles = useThemeStyles();
    const route = useRoute<
        PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT> | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();

    const shouldDisplayTransactionNavigation = !!(reportID && route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT);
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');

    return (
        <View
            style={
                isNarrow
                    ? [styles.flexRow, styles.gap2, shouldDisplayTransactionNavigation && styles.mr3]
                    : [styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]
            }
        >
            <MoneyRequestHeaderPrimaryAction
                reportID={reportID}
                isNarrow={isNarrow}
                isFromReviewDuplicates={isFromReviewDuplicates}
            />
            <MoneyRequestHeaderSecondaryActions
                reportID={reportID}
                onBackButtonPress={onBackButtonPress}
                isNarrow={isNarrow}
            />
        </View>
    );
}

MoneyRequestHeaderActions.displayName = 'MoneyRequestHeaderActions';

export default MoneyRequestHeaderActions;
