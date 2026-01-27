import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
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
import AmexCustomFeed from './AmexCustomFeed';
import CardInstructionsStep from './CardInstructionsStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import DetailsStep from './DetailsStep';
import DirectStatementCloseDateStep from './DirectStatementCloseDatePage';
import ImportFromFileStep from './ImportFromFileStep';
import PlaidConnectionStep from './PlaidConnectionStep';
import SelectBankStep from './SelectBankStep';
import SelectCountryStep from './SelectCountryStep';
import SelectFeedType from './SelectFeedType';
import StatementCloseDateStep from './StatementCloseDateStep';

function AddNewCardPage({policy}: WithPolicyAndFullscreenLoadingProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [addNewCardFeed, addNewCardFeedMetadata] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: false});
    const {currentStep} = addNewCardFeed ?? {};
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {translate} = useLocalize();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: false});

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
        // If the user only has a domain feed, a workspace account may not have been created yet.
        // However, adding a workspace feed requires a workspace account.
        // Calling openPolicyAddCardFeedPage will trigger the creation of a workspace account.
        if (workspaceAccountID) {
            return;
        }
        openPolicyAddCardFeedPage(policyID);
    }, [workspaceAccountID, policyID]);

    if (isAddCardFeedLoading || isAllFeedsResultLoading || isBlockedToAddNewFeeds) {
        return <FullScreenLoadingIndicator />;
    }

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID="AddNewCardPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

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
            CurrentStep = <DetailsStep />;
            break;
        case CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED:
            CurrentStep = <AmexCustomFeed />;
            break;
        case CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION:
            CurrentStep = <PlaidConnectionStep onExit={() => setIsModalVisible(true)} />;
            break;
        case CONST.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE:
            CurrentStep = (
                <StatementCloseDateStep
                    policyID={policyID}
                    workspaceAccountID={workspaceAccountID}
                />
            );
            break;
        case CONST.COMPANY_CARDS.STEP.SELECT_DIRECT_STATEMENT_CLOSE_DATE:
            CurrentStep = <DirectStatementCloseDateStep policyID={policyID} />;
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
        >
            <View style={styles.flex1}>{CurrentStep}</View>
            <ConfirmModal
                isVisible={isModalVisible}
                title={translate('workspace.companyCards.addNewCard.exitModal.title')}
                success
                confirmText={translate('workspace.companyCards.addNewCard.exitModal.confirmText')}
                cancelText={translate('workspace.companyCards.addNewCard.exitModal.cancelText')}
                prompt={translate('workspace.companyCards.addNewCard.exitModal.prompt')}
                onCancel={() => setIsModalVisible(false)}
                onConfirm={() => {
                    setIsModalVisible(false);
                    navigateToConciergeChat(conciergeReportID, false);
                }}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(AddNewCardPage);
