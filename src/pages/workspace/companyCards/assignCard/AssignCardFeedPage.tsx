import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useInitial from '@hooks/useInitial';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BankConnection from '@pages/workspace/companyCards/BankConnection';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import Navigation from '@libs/Navigation/Navigation';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import TransactionStartDateStep from './TransactionStartDateStep';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ROUTES, { Route } from '@src/ROUTES';

type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const currentStep = assignCard?.currentStep;

    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeed;
    const backTo = route.params?.backTo;
    const policyID = policy?.id;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate, canBeMissing: true});
    const firstAssigneeEmail = useInitial(assignCard?.data?.email);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === assignCard?.data?.email;

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AssignCardFeedPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

     // Navigate to appropriate step based on current state
     useEffect(() => {
        if (isActingAsDelegate) {
            return; // Show delegate access denied
        }

        // const currentStep = assignCard?.currentStep;
        
        // Determine which screen to navigate to based on current step
        const getScreenForStep = (step: string | undefined): Route | undefined => {
            if(!policyID){
                return undefined;
            }
            if (!step || !feed) {
                return ROUTES.WORKSPACE_ASSIGN_COMPANY_CARD_ASSIGNEE.getRoute(policyID, feed, backTo || '');
            }
        
            switch (step) {
                case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
                    return ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(policyID, feed, backTo || '');
        
                case CONST.COMPANY_CARD.STEP.ASSIGNEE:
                    return ROUTES.WORKSPACE_ASSIGN_COMPANY_CARD_ASSIGNEE.getRoute(policyID, feed, backTo || '');
                case CONST.COMPANY_CARD.STEP.CARD:
                    return ROUTES.WORKSPACE_ASSIGN_COMPANY_CARD_SELECTION.getRoute(policyID, feed, backTo || '');
                case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
                    return ROUTES.WORKSPACE_COMPANY_CARDS_TRANSACTION_START_DATE.getRoute(policyID, feed, backTo || '');
                case CONST.COMPANY_CARD.STEP.CARD_NAME:
                    return ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_CARD_NAME.getRoute(policyID, feed, backTo || '');
                case CONST.COMPANY_CARD.STEP.CONFIRMATION:
                    return ROUTES.WORKSPACE_COMPANY_CARDS_CONFIRMATION.getRoute(policyID, feed, backTo || '');
                default:
                    return ROUTES.WORKSPACE_ASSIGN_COMPANY_CARD_ASSIGNEE.getRoute(policyID, feed, backTo || '');
            }
        };

        const targetScreen = getScreenForStep(currentStep);

            if(targetScreen) {
                // Navigate to the appropriate step
                Navigation.navigate(targetScreen);
            }
        }, [assignCard?.currentStep, isActingAsDelegate, Navigation, feed, policyID, backTo]);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AssignCardFeedPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    // // Show loading or empty state while navigation happens
    // return (
    //     <ScreenWrapper testID={AssignCardFeedPage.displayName}>
    //        <FullScreenLoadingIndicator
    //        />
    //     </ScreenWrapper>
    // );
}

AssignCardFeedPage.displayName = 'AssignCardFeedPage';
export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
