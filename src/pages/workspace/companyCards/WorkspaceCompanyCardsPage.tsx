import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';

const mockedCards = {
    id1: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id2: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
} as unknown as WorkspaceCardsList;

type WorkspaceCompanyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            // featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                icon={Illustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
                shouldShowOfflineIndicatorInWideScreen
            >
                <WorkspaceCompanyCardsList
                    cardsList={mockedCards}
                    policyID={policyID}
                />
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
