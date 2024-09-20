import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Welcome from '@userActions/Welcome';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import type {OnboardingCompanySizeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingEmployeesProps} from './types';

function BaseOnboardingEmployees({shouldUseNativeStyles, route}: BaseOnboardingEmployeesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [selectedCompanySize, setSelectedCompanySize] = useState<OnboardingCompanySizeType | null | undefined>(onboardingCompanySize);
    const [error, setError] = useState('');

    const companySizeOptions: ListItem[] = useMemo(() => {
        return Object.values(CONST.ONBOARDING_COMPANY_SIZE).map((companySize): ListItem => {
            return {
                text: translate(`onboarding.employees.${companySize}`),
                keyForList: companySize,
                isSelected: companySize === selectedCompanySize,
                leftElement: onboardingIsMediumOrLargerScreenWidth ? <View style={styles.ml3} /> : null,
                rightElement: onboardingIsMediumOrLargerScreenWidth ? <View style={styles.mr3} /> : null,
            };
        });
    }, [translate, selectedCompanySize, onboardingIsMediumOrLargerScreenWidth, styles.ml3, styles.mr3]);

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
                text={translate('common.confirm')}
                onPress={() => {
                    if (!selectedCompanySize) {
                        setError(translate('onboarding.purpose.errorSelection'));
                        return;
                    }
                    Welcome.setOnboardingCompanySize(selectedCompanySize);
                    Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(route.params?.backTo));
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            shouldEnableKeyboardAvoidingView
            testID="BaseOnboardingEmployees"
        >
            <View style={[styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
                <HeaderWithBackButton
                    shouldShowBackButton
                    progressBarPercentage={onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? 50 : 75}
                    onBackButtonPress={OnboardingFlow.goBack}
                />
                <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeadlineH1]}>{translate('onboarding.employees.title')}</Text>
                    </View>
                </View>
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
                />
                {shouldUseNarrowLayout && <OfflineIndicator />}
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingEmployees.displayName = 'BaseOnboardingEmployees';

export default BaseOnboardingEmployees;
