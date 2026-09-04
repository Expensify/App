import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToConciergeChat} from '@libs/actions/Report';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import BankConnection from '@pages/workspace/companyCards/BankConnection';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import {clearAddNewCardFlow, openPolicyAddCardFeedPage} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import AmexCustomFeed from './AmexCustomFeed';
import CardInstructionsStep from './CardInstructionsStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import DetailsStep from './DetailsStep';
import ImportFromFileStep from './ImportFromFileStep';
import PlaidConnectionStep from './PlaidConnectionStep';
import SelectBankStep from './SelectBankStep';
import SelectCountryStep from './SelectCountryStep';
import SelectFeedType from './SelectFeedType';

function DynamicAddNewCardPage({policy}: WithPolicyAndFullscreenLoadingProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const [addNewCardFeed, addNewCardFeedMetadata] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const {currentStep} = addNewCardFeed ?? {};
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading, cardFeeds, workspaceAccountID} = useIsBlockedToAddFeed(policyID);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();

    const isAddCardFeedLoading = isLoadingOnyxValue(addNewCardFeedMetadata);

    useEffect(() => {
        if (!policyID || !isBlockedToAddNewFeeds) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)), {
            forceReplace: true,
        });
    }, [isBlockedToAddNewFeeds, policyID]);

    useEffect(() => {
        return () => {
            clearAddNewCardFlow();
        };
    }, []);

    useEffect(() => {
        // If the user only has a domain feed, then the workspace account may not have been created yet, or the "Company cards" workspace-level feature may not have been enabled yet
        // However, adding a workspace feed requires a workspace account with "Company cards" feature enabled.
        // Calling openPolicyAddCardFeedPage will trigger the creation of the workspace account (if necessary) and enable the "Company cards" feature (if not enabled).
        openPolicyAddCardFeedPage(policyID);
    }, [policyID]);

    if (isAddCardFeedLoading || isAllFeedsResultLoading || isBlockedToAddNewFeeds) {
        return <FullScreenLoadingIndicator />;
    }

    if (isDelegateAccessRestricted) {
        return (
            <ScreenWrapper
                testID="AddNewCardPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]} />
            </ScreenWrapper>
        );
    }

    const handlePlaidExit = () => {
        showConfirmModal({
            title: translate('workspace.companyCards.addNewCard.exitModal.title'),
            buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            confirmText: translate('workspace.companyCards.addNewCard.exitModal.confirmText'),
            cancelText: translate('workspace.companyCards.addNewCard.exitModal.cancelText'),
            prompt: translate('workspace.companyCards.addNewCard.exitModal.prompt'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
        });
    };

    let CurrentStep: React.JSX.Element;
    switch (currentStep) {
        case CONST.COMPANY_CARDS.STEP.SELECT_BANK:
            CurrentStep = <SelectBankStep />;
            break;
        case CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE:
            CurrentStep = <SelectFeedType />;
            break;
        case CONST.COMPANY_CARDS.STEP.CARD_TYPE:
            CurrentStep = <CardTypeStep />;
            break;
        case CONST.COMPANY_CARDS.STEP.BANK_CONNECTION:
            CurrentStep = <BankConnection policyID={policyID} />;
            break;
        case CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
            CurrentStep = <CardInstructionsStep policyID={policyID} />;
            break;
        case CONST.COMPANY_CARDS.STEP.CARD_NAME:
            CurrentStep = <CardNameStep />;
            break;
        case CONST.COMPANY_CARDS.STEP.CARD_DETAILS:
            CurrentStep = (
                <DetailsStep
                    policyID={policyID}
                    cardFeeds={cardFeeds}
                    workspaceAccountID={workspaceAccountID}
                />
            );
            break;
        case CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED:
            CurrentStep = <AmexCustomFeed />;
            break;
        case CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION:
            CurrentStep = <PlaidConnectionStep onExit={handlePlaidExit} />;
            break;
        case CONST.COMPANY_CARDS.STEP.IMPORT_FROM_FILE:
            CurrentStep = <ImportFromFileStep />;
            break;
        default:
            CurrentStep = <SelectCountryStep policyID={policyID} />;
            break;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <View style={styles.flex1}>{CurrentStep}</View>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(DynamicAddNewCardPage);
