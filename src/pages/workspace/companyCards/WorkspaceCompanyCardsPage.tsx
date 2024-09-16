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
        cardID: 885646,
        accountID: 11309072,
        bank: 'cdfbmo',
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id2: {
        accountID: 885646,
        bank: 'cdfbmo',
        cardID: 885642,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id18: {
        accountID: 885646,
        cardID: 885643,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id27: {
        cardID: 885644,
        accountID: 885646,
        bank: 'cdfbmo',
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id16: {
        cardID: 885645,
        accountID: 885646,
        bank: 'cdfbmo',
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id25: {
        cardID: 885646,
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id14: {
        cardID: 885647,
        accountID: 885646,
        bank: 'cdfbmo',
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id23: {
        cardID: 885648,
        accountID: 885646,
        bank: 'cdfbmo',
        nameValuePairs: {
            cardTitle: 'Test 2',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id12: {
        cardID: 885649,
        accountID: 885646,
        nameValuePairs: {
            cardTitle: 'Test 1',
        },
        cardNumber: '1234 56XX XXXX 1222',
    },
    id21: {
        cardID: 885640,
        accountID: 885646,
        bank: 'cdfbmo',
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

    // useEffect(() => {
    //     Onyx.merge('cards_18175034_cdfbmo', {
    //         id1: {
    //             cardID: 885646,
    //             accountID: 11309072,
    //             bank: 'cdfbmo',
    //             nameValuePairs: {
    //                 cardTitle: 'Test 1',
    //                 exportAccountDetails: {
    //                     quickbooks_desktop_export_account_credit: 'Credit card 2',
    //                 },
    //             },
    //             cardNumber: '1234 56XX XXXX 1222',
    //             lastFourPAN: '1222',
    //             lastUpdated: '10 minutes ago',
    //             startDate: new Date(),
    //         },
    //     });
    //     Onyx.merge('policy_7DE6960B26D79E36', {
    //         connections: {
    //             [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
    //                 config: {
    //                     nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
    //                 },
    //                 data: {
    //                     creditCards: [
    //                         {id: 1, name: 'Credit card 1'},
    //                         {id: 2, name: 'Credit card 2'},
    //                         {id: 3, name: 'Credit card 3'},
    //                     ],
    //                 },
    //             },
    //         },
    //     });
    // }, []);

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
                {isFeedAdded && (
                    <WorkspaceCompanyCardsList
                        cardsList={cardsList}
                        policyID={policyID}
                    />
                )}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
