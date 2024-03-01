import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Button from '@components/Button';
import MenuItemList from '@components/MenuItemList';
import type { MenuItemProps } from '@components/MenuItem';
import CONST from '@src/CONST';
import * as Illustrations from '@components/Icon/Illustrations';
import * as Expensicons from '@components/Icon/Expensicons';
import variables from '@styles/variables';
import Icon from '@components/Icon';
import { ScrollView } from 'react-native-gesture-handler';
import useWindowDimensions from '@hooks/useWindowDimensions';

type ValuesType<T> = T[keyof T];
type SelectedPurposeType = ValuesType<typeof CONST.ONBOARDING_CHOICES> | undefined;

const menuIcons = {
    [CONST.ONBOARDING_CHOICES.TRACK]: Illustrations.CompanyCard,
    [CONST.ONBOARDING_CHOICES.EMPLOYER]: Illustrations.ReceiptUpload,
    [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: Illustrations.Abacus,
    [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: Illustrations.PiggyBank,
    [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: Illustrations.SplitBill,
    [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: Illustrations.Binoculars,
};

function OnboardingPurpose() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [selectedPurpose, setSelectedPurpose] = useState<SelectedPurposeType>(undefined);
    const {isSmallScreenWidth} = useWindowDimensions();
    const theme = useTheme();

    const handleGoBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
    }, []);

    const selectedCheckboxIcon = useMemo(() => (
        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
            <Icon
                src={Expensicons.Checkmark}
                fill={theme.success}
            />
        </View>), [styles.pointerEventsAuto, styles.popoverMenuIcon, theme.success]);

    const completeEngagement = useCallback(() => {
        if(selectedPurpose === undefined) {
            return;
        }
        
        /*
        ! This functionality is temporarily removed until we can disable PurposeForUsingExpensifyPage
        ! and refactor the function to support new options for Report.completeEngagementModal();

        const translationKey = `onboarding.purpose.${selectedPurpose}` as const;
        Report.completeEngagementModal(translate(translationKey), selectedPurpose);
        */

        if(!isSmallScreenWidth) {
            // Only navigate to concierge chat for wide-screen devices
            Report.navigateToConciergeChat(false, true);
        }
    }, [isSmallScreenWidth, selectedPurpose]);

    const menuItems: MenuItemProps[] =
            Object.values(CONST.ONBOARDING_CHOICES).map((choice) => {
                const translationKey = `onboarding.purpose.${choice}` as const;
                const isSelected = selectedPurpose === choice;
                return {
                    key: translationKey,
                    title: translate(translationKey),
                    icon: menuIcons[choice],
                    iconWidth: variables.purposeMenuIconSize,
                    iconHeight: variables.purposeMenuIconSize,
                    iconStyles: [styles.mh3],
                    wrapperStyle: [styles.purposeMenuItem, isSelected && styles.purposeMenuItemSelected],
                    hoverAndPressStyle: [styles.purposeMenuItemSelected],
                    rightComponent: selectedCheckboxIcon,
                    shouldShowRightComponent: isSelected,
                    onPress: () => {
                        setSelectedPurpose(choice);
                    },
                };
            },
    );

    return (
        <View style={[styles.h100, styles.defaultModalContainer, !shouldUseNarrowLayout && styles.pt8]}>
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleGoBack}
                onCloseButtonPress={closeModal}
                iconFill={theme.iconColorfulBackground}
                progressBarPercentage={66.6}
            />
            <View style={[styles.flex1, styles.dFlex, styles.flexGrow1, styles.mv5, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]}>
                <View style={[styles.flex1]}>
                    <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeroSmall]}>{translate('onboarding.purpose.title')} </Text>
                    </View>
                    <ScrollView>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                    </ScrollView>
                </View>
                <Button
                    success
                    onPress={completeEngagement}
                    isDisabled={selectedPurpose === undefined}
                    text={translate('common.continue')}
                />
            </View>
        </View>
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
