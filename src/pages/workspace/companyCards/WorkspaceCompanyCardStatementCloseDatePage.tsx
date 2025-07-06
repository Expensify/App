import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getSelectedFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';
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

    const submit = useCallback(
        // s77rt make use of statementCloseDate / statementCustomCloseDate and remove disable lint rule
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (statementCloseDate: CompanyCardStatementCloseDate, statementCustomCloseDate: number | undefined) => {
            if (selectedFeed) {
                // s77rt call API command
            }

            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
        },
        [policyID, selectedFeed],
    );

    const goBack = useCallback(() => {
        Navigation.goBack();
    }, []);

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
            />
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardStatementCloseDatePage.displayName = 'WorkspaceCompanyCardStatementCloseDatePage';

export default WorkspaceCompanyCardStatementCloseDatePage;
