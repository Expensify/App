import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import Navigation from '@navigation/Navigation';
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
    const {isBetaEnabled} = usePermissions();
    const {isBlockToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: false});

    const isAddCardFeedLoading = isLoadingOnyxValue(addNewCardFeedMetadata);

    useEffect(() => {
        if (!isBlockToAddNewFeeds || !policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)), {
            forceReplace: true,
        });
    }, [isBlockToAddNewFeeds, policyID]);

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

    if (isAddCardFeedLoading || isBlockToAddNewFeeds || isAllFeedsResultLoading) {
        return <FullScreenLoadingIndicator />;
    }

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AddNewCardPage.displayName}
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
            CurrentStep = <PlaidConnectionStep />;
            break;
        case CONST.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE:
            CurrentStep = <StatementCloseDateStep policyID={policyID} />;
            break;
        case CONST.COMPANY_CARDS.STEP.SELECT_DIRECT_STATEMENT_CLOSE_DATE:
            CurrentStep = <DirectStatementCloseDateStep policyID={policyID} />;
            break;
        default:
            CurrentStep = isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) ? <SelectCountryStep policyID={policyID} /> : <SelectBankStep />;
            break;
    }

    return (
        <View
            style={styles.flex1}
            fsClass={CONST.FULLSTORY.CLASS.MASK}
        >
            {CurrentStep}
        </View>
    );
}

AddNewCardPage.displayName = 'AddNewCardPage';
export default withPolicyAndFullscreenLoading(AddNewCardPage);
