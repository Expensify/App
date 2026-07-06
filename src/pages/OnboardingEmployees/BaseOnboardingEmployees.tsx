import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {OnboardingCompanySize} from '@libs/actions/Welcome/OnboardingFlow';
import {getPreviousOnboardingRoute} from '@libs/getOnboardingStepCounter';
import Navigation from '@libs/Navigation/Navigation';

import {setOnboardingCompanySize} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React, {useCallback, useMemo, useState} from 'react';

import type {BaseOnboardingEmployeesProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingCompanySize;
};
function BaseOnboardingEmployees({shouldUseNativeStyles, route}: BaseOnboardingEmployeesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES);
    const isEmployeesFirstStep = onboardingStep?.stepCounter.step === 1;
    const [selectedCompanySize, setSelectedCompanySize] = useState<OnboardingCompanySize | null | undefined>(onboardingCompanySize);
    const [error, setError] = useState('');

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);

    const onboardingFlowContext = useMemo(
        () => ({
            signupQualifier: onboardingValues?.signupQualifier,
            isFromPublicDomain: account?.isFromPublicDomain,
            hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
            purposeSelected: purposeSelected ?? undefined,
            isMergeAccountStepSkipped: onboardingValues?.isMergeAccountStepSkipped,
            isAccountValidated: !!account?.validated,
        }),
        [
            account?.hasAccessibleDomainPolicies,
            account?.isFromPublicDomain,
            account?.validated,
            onboardingValues?.isMergeAccountStepSkipped,
            onboardingValues?.signupQualifier,
            purposeSelected,
        ],
    );

    const handleBackButtonPress = useCallback(() => {
        const previousRoute = getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, onboardingFlowContext, route.params?.backTo);

        if (previousRoute) {
            Navigation.navigate(previousRoute);
            return;
        }

        Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute());
    }, [onboardingFlowContext, route.params?.backTo]);

    const companySizeOptions: OnboardingListItem[] = useMemo(() => {
        const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
        const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
        return Object.values(CONST.ONBOARDING_COMPANY_SIZE)
            .filter((size) => {
                // Always hide the deprecated 1-10 option.
                if (size === CONST.ONBOARDING_COMPANY_SIZE.MICRO) {
                    return false;
                }
                // For VSB-qualified users (1-9 from landing page), only show 1-4 and 5-10.
                if (isVsb) {
                    return size === CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL || size === CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM;
                }
                // For SMB-qualified users, hide 1-4 and 5-10 since they already indicated 10+.
                if (isSmb) {
                    return size !== CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL && size !== CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM;
                }
                return true;
            })
            .map((companySize): OnboardingListItem => {
                return {
                    text: translate(`onboarding.employees.${companySize}`),
                    keyForList: companySize,
                    isSelected: companySize === selectedCompanySize,
                };
            });
    }, [translate, selectedCompanySize, onboardingValues?.signupQualifier]);

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
                    Navigation.navigate(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute());
                }}
                pressOnEnter
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.CONTINUE}
            />
        </>
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingEmployees"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!isEmployeesFirstStep}
                stepCounter={onboardingStep?.stepCounter}
                progressBarPercentage={onboardingStep?.progressBarPercentage}
                onBackButtonPress={handleBackButtonPress}
                shouldDisplayHelpButton={false}
            />
            <Text
                style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('onboarding.employees.title')}
            </Text>
            <SelectionList
                data={companySizeOptions}
                onSelectRow={(item) => {
                    setSelectedCompanySize(item.keyForList);
                    setError('');
                }}
                initiallyFocusedItemKey={companySizeOptions.find((item) => item.keyForList === selectedCompanySize)?.keyForList}
                shouldUpdateFocusedIndex
                ListItem={SingleSelectListItem}
                footerContent={footerContent}
                style={{listItemWrapperStyle: onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}}
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingEmployees;
