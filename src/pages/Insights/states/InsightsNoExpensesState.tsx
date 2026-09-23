import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';

/** Stands in for the whole dashboard when the account has no expenses at all. */
function InsightsNoExpensesState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Chart']);

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.Chart}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            headerContentStyles={[styles.insightsEmptyStateIllustration]}
            title={translate('insightsPage.noExpensesState.title')}
            subtitle={translate('insightsPage.noExpensesState.subtitle')}
            buttons={[
                {
                    buttonText: translate('iou.createExpense'),
                    buttonAction: () => startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), undefined),
                    buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                },
            ]}
        />
    );
}

export default InsightsNoExpensesState;
