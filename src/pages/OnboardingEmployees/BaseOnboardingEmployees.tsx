import React, {useMemo, useState} from 'react';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OnboardingCompanySize} from '@libs/actions/Welcome/OnboardingFlow';
import Navigation from '@libs/Navigation/Navigation';
import {setOnboardingCompanySize} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingEmployeesProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingCompanySize;
};
function BaseOnboardingEmployees({shouldUseNativeStyles, route}: BaseOnboardingEmployeesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [selectedCompanySize, setSelectedCompanySize] = useState<OnboardingCompanySize | null | undefined>(onboardingCompanySize);
    const [error, setError] = useState('');

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const companySizeOptions: OnboardingListItem[] = useMemo(() => {
        const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
        return Object.values(CONST.ONBOARDING_COMPANY_SIZE)
            .filter((size) => !isSmb || size !== CONST.ONBOARDING_COMPANY_SIZE.MICRO)
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
                    Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(route.params?.backTo));
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingEmployees"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? 80 : 90}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute());
                }}
                shouldDisplayHelpButton={false}
            />
            <Text style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]} accessibilityRole="header">
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
                ListItem={RadioListItem}
                footerContent={footerContent}
                style={{listItemWrapperStyle: onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}}
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingEmployees;
