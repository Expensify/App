import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect, useRef} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useCardFeeds from '@hooks/useCardFeeds';
import useInitial from '@hooks/useInitial';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {importPlaidAccounts} from '@libs/actions/Plaid';
import {getCompanyCardFeed, getCompanyFeeds, getPlaidCountry, getPlaidInstitutionId, isSelectedFeedExpired} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDomainNameForPolicy, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import LoadingPage from '@pages/LoadingPage';
import PlaidConnectionStep from '@pages/workspace/companyCards/addNew/PlaidConnectionStep';
import BankConnection from '@pages/workspace/companyCards/BankConnection';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID, CurrencyList} from '@src/types/onyx';
import type {AssignCardData} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import InviteNewMemberStep from './InviteNewMemberStep';
import TransactionStartDateStep from './TransactionStartDateStep';

type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const backTo = route.params?.backTo;
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeedWithDomainID;
    const cardID = route.params?.cardID ? decodeURIComponent(route.params?.cardID) : undefined;
    const policyID = policy?.id;

    const {translate} = useLocalize();

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: true});

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const currentStep = assignCard?.currentStep;
    const firstAssigneeEmail = useInitial(assignCard?.data?.email);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === assignCard?.data?.email;

    // Set the initial step and data if not already set
    const {initialStep, initialStepData} = useInitialAssignCardStep({policyID, feed, cardID});
    const initialStepSet = useRef(false);
    useEffect(() => {
        if (currentStep || initialStepSet.current) {
            return;
        }

        initialStepSet.current = true;
        setAssignCardStepAndData({
            currentStep: initialStep,
            data: initialStepData,
        });
    }, [currentStep, initialStep, initialStepData]);

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID="AssignCardFeedPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                />
            );
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        case CONST.COMPANY_CARD.STEP.ASSIGNEE:
            return (
                <AssigneeStep
                    policy={policy}
                    route={route}
                />
            );
        case CONST.COMPANY_CARD.STEP.CARD:
            return (
                <CardSelectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
            return <TransactionStartDateStep route={route} />;
        case CONST.COMPANY_CARD.STEP.CARD_NAME:
            return <CardNameStep policyID={policyID} />;
        case CONST.COMPANY_CARD.STEP.CONFIRMATION:
            return (
                <ConfirmationStep
                    policyID={policyID}
                    feed={feed}
                    backTo={shouldUseBackToParam ? backTo : undefined}
                />
            );
        case CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER:
            return (
                <InviteNewMemberStep
                    route={route}
                    feed={feed}
                />
            );
        default:
            return <LoadingPage title={translate('workspace.companyCards.assignCard')} />;
    }
}

type UseInitialAssignCardStepProps = {
    policyID: string | undefined;
    feed: CompanyCardFeedWithDomainID;
    cardID: string | undefined;
};

function useInitialAssignCardStep({policyID, feed, cardID}: UseInitialAssignCardStepProps) {
    const {isOffline} = useNetwork();

    const policy = usePolicy(policyID);

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const feedData = feed && companyCards[feed];
    const bankName = getCompanyCardFeed(feed);

    const data: Partial<AssignCardData> = {
        bankName,
        cardNumber: cardID,
        encryptedCardNumber: cardID,
    };

    const isFeedExpired = isSelectedFeedExpired(feedData);
    const plaidAccessToken = feedData?.plaidAccessToken;

    // Refetch plaid card list
    if (!isFeedExpired && plaidAccessToken) {
        const country = feedData?.country ?? '';
        importPlaidAccounts('', feed, '', country, getDomainNameForPolicy(policyID), '', undefined, undefined, plaidAccessToken);
    }

    if (isFeedExpired || !cardID) {
        const institutionId = !!getPlaidInstitutionId(feed);
        if (institutionId) {
            const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
            setAddNewCompanyCardStepAndData({
                data: {
                    selectedCountry: country,
                },
            });

            return {
                initialStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
                initialStepData: data,
            };
        }

        return {
            initialStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
            initialStepData: data,
        };
    }

    const employeeList = Object.values(policy?.employeeList ?? {}).filter((employee) => !isDeletedPolicyEmployee(employee, isOffline));
    if (employeeList.length === 1) {
        const userEmail = Object.keys(policy?.employeeList ?? {}).at(0) ?? '';
        data.email = userEmail;
        const personalDetails = getPersonalDetailByEmail(userEmail);
        const memberName = personalDetails?.firstName ? personalDetails.firstName : personalDetails?.login;
        data.cardName = `${memberName}'s card`;

        return {
            initialStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
            initialStepData: data,
        };
    }

    return {
        initialStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
        initialStepData: data,
    };
}

export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
