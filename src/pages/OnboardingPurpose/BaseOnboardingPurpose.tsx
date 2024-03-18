import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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

type BaseOnboardingPurposeProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

function BaseOnboardingPurpose({shouldUseNativeStyles}: BaseOnboardingPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [selectedPurpose, setSelectedPurpose] = useState<SelectedPurposeType>(undefined);
    const {isSmallScreenWidth} = useWindowDimensions();
    const theme = useTheme();

    const paddingHorizontal = shouldUseNarrowLayout ? styles.ph8 : styles.ph5;

    const handleGoBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const selectedCheckboxIcon = useMemo(
        () => (
            <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                <Icon
                    src={Expensicons.Checkmark}
                    fill={theme.success}
                />
            </View>
        ),
        [styles.pointerEventsAuto, styles.popoverMenuIcon, theme.success],
    );

    const completeEngagement = useCallback(() => {
        if (selectedPurpose === undefined) {
            return;
        }

        Report.completeEngagementModal(CONST.ONBOARDING_CONCIERGE[selectedPurpose], selectedPurpose);

        // Only navigate to concierge chat when central pane is visible
        // Otherwise stay on the chats screen.
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.ROOT);
        } else {
            Report.navigateToConciergeChat();
        }

        // Small delay purely due to design considerations,
        // no special technical reasons behind that.
        setTimeout(() => {
            Navigation.navigate(ROUTES.WELCOME_VIDEO_ROOT);
        }, variables.welcomeVideoDelay);
    }, [isSmallScreenWidth, selectedPurpose]);

    const menuItems: MenuItemProps[] = Object.values(CONST.ONBOARDING_CHOICES).map((choice) => {
        const translationKey = `onboarding.purpose.${choice}` as const;
        const isSelected = selectedPurpose === choice;
        return {
            key: translationKey,
            title: translate(translationKey),
            icon: menuIcons[choice],
            displayInDefaultIconColor: true,
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
    });

    return (
        <View style={[styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <View style={shouldUseNarrowLayout && styles.mh3}>
                <HeaderWithBackButton
                    shouldShowBackButton
                    onBackButtonPress={handleGoBack}
                    progressBarPercentage={66.6}
                />
            </View>
            <ScrollView style={[styles.flex1, styles.flexGrow1, styles.mt5, !shouldUseNarrowLayout && styles.mb5, paddingHorizontal]}>
                <View style={styles.flex1}>
                    <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={styles.textHeroSmall}>{translate('onboarding.purpose.title')} </Text>
                    </View>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </View>
            </ScrollView>
            <View style={[styles.pb5, paddingHorizontal]}>
                <Button
                    large
                    success
                    onPress={completeEngagement}
                    isDisabled={!selectedPurpose}
                    text={translate('common.continue')}
                />
            </View>
        </View>
    );
}

BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';
export default BaseOnboardingPurpose;

export type {BaseOnboardingPurposeProps};
