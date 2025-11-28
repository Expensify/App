import React, {useCallback} from 'react';
import useOnyx from 'react-native-onyx/dist/useOnyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import {addNewCompanyCardsFeed, setAddNewCompanyCardStepAndData} from '@libs/actions/CompanyCards';
import Navigation from '@libs/Navigation/Navigation';
import WorkspaceCompanyCardStatementCloseDateSelectionList from '@pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDateSelectionList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';

type StatementCloseDateStepProps = {
    /** ID of the current policy */
    policyID: string | undefined;
};

function StatementCloseDateStep({policyID}: StatementCloseDateStepProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: false});
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [cardFeeds] = useCardFeeds(policyID);

    const isPlaid = isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && !!addNewCard?.data?.publicToken;

    const submit = useCallback(
        (statementPeriodEnd: StatementPeriodEnd | undefined, statementPeriodEndDay: StatementPeriodEndDay | undefined) => {
            if (isPlaid) {
                setAddNewCompanyCardStepAndData({
                    step: CONST.COMPANY_CARDS.STEP.BANK_CONNECTION,
                    // Fallback to null to clear old value (if any) because `undefined` is a no-op in Onyx.merge
                    data: {statementPeriodEnd: statementPeriodEnd ?? null, statementPeriodEndDay: statementPeriodEndDay ?? null},
                });
                return;
            }

            if (addNewCard?.data.feedDetails) {
                addNewCompanyCardsFeed(policyID, addNewCard.data.feedType, addNewCard.data.feedDetails, cardFeeds, statementPeriodEnd, statementPeriodEndDay, lastSelectedFeed);
                Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            }
        },
        [policyID, addNewCard?.data.feedType, addNewCard?.data.feedDetails, cardFeeds, lastSelectedFeed, isPlaid],
    );

    const goBack = useCallback(() => {
        setAddNewCompanyCardStepAndData({step: isPlaid ? CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION : CONST.COMPANY_CARDS.STEP.CARD_DETAILS});
    }, [isPlaid]);

    return (
        <WorkspaceCompanyCardStatementCloseDateSelectionList
            confirmText={translate('common.submit')}
            onSubmit={submit}
            onBackButtonPress={goBack}
            enabledWhenOffline={false}
            defaultStatementPeriodEnd={CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH}
        />
    );
}

StatementCloseDateStep.displayName = 'StatementCloseDateStep';

export default StatementCloseDateStep;
