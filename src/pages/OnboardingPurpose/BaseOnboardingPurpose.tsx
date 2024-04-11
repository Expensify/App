import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import OfflineIndicator from '@components/OfflineIndicator';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import useDisableModalDismissOnEscape from '@hooks/useDisableModalDismissOnEscape';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingPurposeOnyxProps, BaseOnboardingPurposeProps} from './types';

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

function BaseOnboardingPurpose({shouldUseNativeStyles, shouldEnableMaxHeight, onboardingPurposeSelected}: BaseOnboardingPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [selectedPurpose, setSelectedPurpose] = useState<SelectedPurposeType>(undefined);
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const [error, setError] = useState(false);
    const theme = useTheme();

    useDisableModalDismissOnEscape();

    const PurposeFooterInstance = <OfflineIndicator />;

    useEffect(() => {
        setSelectedPurpose(onboardingPurposeSelected ?? undefined);
    }, [onboardingPurposeSelected]);

    const errorMessage = error ? 'onboarding.purpose.error' : '';

    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;

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

        Navigation.dismissModal();
        // Only navigate to concierge chat when central pane is visible
        // Otherwise stay on the chats screen.
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.HOME);
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
                Welcome.setOnboardingPurposeSelected(choice);
                setError(false);
            },
        };
    });

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8, safeAreaPaddingBottomStyle]}>
                    <View style={shouldUseNarrowLayout && styles.mh3}>
                        <HeaderWithBackButton
                            shouldShowBackButton
                            onBackButtonPress={handleGoBack}
                            progressBarPercentage={66.6}
                        />
                    </View>
                    <ScrollView style={[styles.flex1, styles.flexGrow1, shouldUseNarrowLayout && styles.mt5, paddingHorizontal]}>
                        <View style={styles.flex1}>
                            <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                                <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.purpose.title')} </Text>
                            </View>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </ScrollView>
                    <FormAlertWithSubmitButton
                        enabledWhenOffline
                        footerContent={isSmallScreenWidth && PurposeFooterInstance}
                        buttonText={translate('common.continue')}
                        onSubmit={() => {
                            if (!selectedPurpose) {
                                setError(true);
                                return;
                            }
                            setError(false);
                            completeEngagement();
                        }}
                        message={errorMessage}
                        isAlertVisible={error || Boolean(errorMessage)}
                        containerStyles={[styles.w100, styles.mb5, styles.mh0, paddingHorizontal]}
                    />
                </View>
            )}
        </SafeAreaConsumer>
    );
}

BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';

export default withOnyx<BaseOnboardingPurposeProps, BaseOnboardingPurposeOnyxProps>({
    onboardingPurposeSelected: {
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    },
})(BaseOnboardingPurpose);

export type {BaseOnboardingPurposeProps, SelectedPurposeType};
