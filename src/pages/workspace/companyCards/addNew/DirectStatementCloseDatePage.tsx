import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {clearErrorField, setFeedStatementPeriodEndDay} from '@libs/actions/CompanyCards';
import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID, getSelectedFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import WorkspaceCompanyCardStatementCloseDateSelectionList from '@pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDateSelectionList';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DirectStatementCloseDateStepProps = {
    /** ID of the current policy */
    policyID?: string;
};
function DirectStatementCloseDateStep({policyID}: DirectStatementCloseDateStepProps) {
    const {translate} = useLocalize();
    const [lastSelectedFeed, lastSelectedFeedResult] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [cardFeeds, cardFeedsResult] = useCardFeeds(policyID);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const feed = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed ? companyFeeds[selectedFeed] : undefined;
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);
    const statementPeriodEndDay = selectedFeedData?.statementPeriodEndDay;

    const [defaultStatementPeriodEnd, defaultStatementPeriodEndDay] = useMemo(() => {
        if (!statementPeriodEndDay) {
            return [undefined, undefined];
        }

        if (typeof statementPeriodEndDay === 'number') {
            return [undefined, statementPeriodEndDay];
        }

        return [statementPeriodEndDay, undefined];
    }, [statementPeriodEndDay]);

    const goBack = useCallback(() => {
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID), {forceReplace: true});
    }, [policyID]);

    const submit = useCallback(
        (newStatementPeriodEnd: StatementPeriodEnd | undefined, newStatementPeriodEndDay: StatementPeriodEndDay | undefined) => {
            if (!policyID) {
                return;
            }
            const isChangedValue = (newStatementPeriodEndDay ?? newStatementPeriodEnd) !== statementPeriodEndDay;
            if (feed && isChangedValue) {
                setFeedStatementPeriodEndDay(policyID, feed, domainOrWorkspaceAccountID, newStatementPeriodEnd, newStatementPeriodEndDay, statementPeriodEndDay);
            }

            goBack();
        },
        [policyID, statementPeriodEndDay, goBack, feed, domainOrWorkspaceAccountID],
    );

    const clearError = useCallback(() => {
        if (!feed) {
            return;
        }

        clearErrorField(feed, domainOrWorkspaceAccountID, 'statementPeriodEndDay');
    }, [feed, domainOrWorkspaceAccountID]);

    if (isLoadingOnyxValue(cardFeedsResult) || isLoadingOnyxValue(lastSelectedFeedResult)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <WorkspaceCompanyCardStatementCloseDateSelectionList
            confirmText={translate('common.apply')}
            onSubmit={submit}
            onBackButtonPress={goBack}
            enabledWhenOffline
            defaultStatementPeriodEnd={defaultStatementPeriodEnd}
            defaultStatementPeriodEndDay={defaultStatementPeriodEndDay}
            pendingAction={selectedFeedData?.pendingFields?.statementPeriodEndDay}
            errors={selectedFeedData?.errorFields?.statementPeriodEndDay}
            onCloseError={clearError}
        />
    );
}

export default DirectStatementCloseDateStep;
