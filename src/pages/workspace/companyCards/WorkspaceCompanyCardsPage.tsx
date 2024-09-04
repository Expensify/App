import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CardFeeds, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';

const mockedFeeds: CardFeeds = {
    companyCards: {
        cdfbmo: {
            pending: false,
            asrEnabled: true,
            forceReimbursable: 'force_no',
            liabilityType: 'corporate',
            preferredPolicy: '',
            reportTitleFormat: '{report:card}{report:bank}{report:submit:from}{report:total}{report:enddate:MMMM}',
            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
        },
    },
    companyCardNicknames: {
        cdfbmo: 'BMO MasterCard',
    },
};

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
    id18: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id27: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id16: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id25: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id14: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id23: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id12: {
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id21: {
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
    // const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    // TODO: use data form onyx instead of mocked one when API is implemented
    // const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const cardFeeds = mockedFeeds;
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const defaultFeed = Object.keys(cardFeeds?.companyCards ?? {})[0];
    const selectedFeed = lastSelectedFeed ?? defaultFeed;

    // TODO: use data form onyx instead of mocked one when API is implemented
    // const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`);
    const cardsList = mockedCards ?? {};

    // TODO correct Onyx flag should be defined in separate PR for "Pending State with No Other Feeds"
    const isFeedAdded = true;

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView={!isFeedAdded}
                icon={Illustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
                shouldShowOfflineIndicatorInWideScreen
                includeSafeAreaPaddingBottom
                showLoadingAsFirstRender={false}
            >
                {isFeedAdded && (
                    <WorkspaceCompanyCardsListHeaderButtons
                        policyID={policyID}
                        selectedFeed={selectedFeed}
                    />
                )}
                {!isFeedAdded && <WorkspaceCompanyCardPageEmptyState route={route} />}
                {isFeedAdded && <WorkspaceCompanyCardsList cardsList={cardsList} />}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
