import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {clearErrorField, setFeedStatementPeriodEndDay} from '@libs/actions/CompanyCards';
import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID, getSelectedFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardStatementCloseDateSelectionList from './WorkspaceCompanyCardStatementCloseDateSelectionList';

type WorkspaceCompanyCardStatementCloseDatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE>;

function WorkspaceCompanyCardStatementCloseDatePage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardStatementCloseDatePageProps) {
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

    const submit = useCallback(
        (newStatementPeriodEnd: StatementPeriodEnd | undefined, newStatementPeriodEndDay: StatementPeriodEndDay | undefined) => {
            const isChangedValue = (newStatementPeriodEndDay ?? newStatementPeriodEnd) !== statementPeriodEndDay;
            if (feed && isChangedValue) {
                setFeedStatementPeriodEndDay(policyID, feed, domainOrWorkspaceAccountID, newStatementPeriodEnd, newStatementPeriodEndDay, statementPeriodEndDay);
            }

            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
        },
        [policyID, feed, statementPeriodEndDay, domainOrWorkspaceAccountID],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
    }, [policyID]);

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
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
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
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardStatementCloseDatePage;
