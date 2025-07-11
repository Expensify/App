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
import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

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
        // s77rt make use of statementCloseDate / statementCustomCloseDate and remove disable lint rule
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (statementCloseDate: CompanyCardStatementCloseDate, statementCustomCloseDate: number | undefined) => {
            if (isPlaid) {
                setAddNewCompanyCardStepAndData({
                    step: CONST.COMPANY_CARDS.STEP.BANK_CONNECTION,
                });
                return;
            }

            if (addNewCard?.data.feedDetails) {
                addNewCompanyCardsFeed(policyID, addNewCard.data.feedType, addNewCard.data.feedDetails, cardFeeds, lastSelectedFeed);
                Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            }
        },
        [policyID, addNewCard, cardFeeds, lastSelectedFeed, isPlaid],
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
            defaultDate={CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH}
        />
    );
}

StatementCloseDateStep.displayName = 'StatementCloseDateStep';

export default StatementCloseDateStep;
