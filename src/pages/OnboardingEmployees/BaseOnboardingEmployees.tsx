import HybridAppModule from '@expensify/react-native-hybrid-app';
import React, {useContext, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {openOldDotLink} from '@userActions/Link';
import {createWorkspace, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingCompanySize, setOnboardingPolicyID, switchToOldDotOnNonMicroCompanySize} from '@userActions/Welcome';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {OnboardingCompanySize} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingEmployeesProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingCompanySize;
};
function BaseOnboardingEmployees({shouldUseNativeStyles, route}: BaseOnboardingEmployeesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find(isPaidGroupPolicy);

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [selectedCompanySize, setSelectedCompanySize] = useState<OnboardingCompanySize | null | undefined>(onboardingCompanySize);
    const [error, setError] = useState('');

    const companySizeOptions: OnboardingListItem[] = useMemo(() => {
        return Object.values(CONST.ONBOARDING_COMPANY_SIZE).map((companySize): OnboardingListItem => {
            return {
                text: translate(`onboarding.employees.${companySize}`),
                keyForList: companySize,
                isSelected: companySize === selectedCompanySize,
            };
        });
    }, [translate, selectedCompanySize]);

    const footerContent = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}
            <Button
                success
                large
                text={translate('common.continue')}
                onPress={() => {
                    if (!selectedCompanySize) {
                        setError(translate('onboarding.errorSelection'));
                        return;
                    }
                    setOnboardingCompanySize(selectedCompanySize);
                    switchToOldDotOnNonMicroCompanySize(selectedCompanySize);

                    const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;

                    // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
                    // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
                    const {adminsChatReportID, policyID} = shouldCreateWorkspace
                        ? createWorkspace(undefined, true, '', generatePolicyID(), CONST.ONBOARDING_CHOICES.MANAGE_TEAM, '', undefined, false)
                        : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

                    if (shouldCreateWorkspace) {
                        setOnboardingAdminsChatReportID(adminsChatReportID);
                        setOnboardingPolicyID(policyID);
                    }

                    // For MICRO companies (1-10 employees) or desktop app, we want to remain on NewDot.
                    if (selectedCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO || getPlatform() === CONST.PLATFORM.DESKTOP) {
                        Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(route.params?.backTo));
                        return;
                    }

                    // For other company sizes we want to complete onboarding here.
                    // At this point `onboardingPurposeSelected` should always exist as we set it in `BaseOnboardingPurpose`.
                    if (onboardingPurposeSelected) {
                        completeOnboarding(
                            onboardingPurposeSelected,
                            CONST.ONBOARDING_MESSAGES[onboardingPurposeSelected],
                            undefined,
                            undefined,
                            adminsChatReportID,
                            onboardingPolicyID,
                            undefined,
                            onboardingCompanySize,
                        );
                    }

                    if (CONFIG.IS_HYBRID_APP) {
                        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
                        setRootStatusBarEnabled(false);
                    } else {
                        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
                    }
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingEmployees"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? 80 : 90}
                onBackButtonPress={Navigation.goBack}
            />
            <Text style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                {translate('onboarding.employees.title')}
            </Text>
            <SelectionList
                sections={[{data: companySizeOptions}]}
                onSelectRow={(item) => {
                    setSelectedCompanySize(item.keyForList);
                    setError('');
                }}
                initiallyFocusedOptionKey={companySizeOptions.find((item) => item.keyForList === selectedCompanySize)?.keyForList}
                shouldUpdateFocusedIndex
                ListItem={RadioListItem}
                footerContent={footerContent}
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
            />
        </ScreenWrapper>
    );
}

BaseOnboardingEmployees.displayName = 'BaseOnboardingEmployees';

export default BaseOnboardingEmployees;
