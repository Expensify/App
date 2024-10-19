import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import OfflineIndicator from '@components/OfflineIndicator';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import type {TOnboardingRef} from '@libs/OnboardingRefManager';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {OnboardingPurposeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {BaseOnboardingPurposeProps} from './types';
import * as Report from '@userActions/Report';
import * as LoginUtils from '@libs/LoginUtils';

const selectableOnboardingChoices = Object.values(CONST.SELECTABLE_ONBOARDING_CHOICES);

function getOnboardingChoices(customChoices: OnboardingPurposeType[]) {
    if (customChoices.length === 0) {
        return selectableOnboardingChoices;
    }

    return selectableOnboardingChoices.filter((choice) => customChoices.includes(choice));
}

const menuIcons = {
    [CONST.ONBOARDING_CHOICES.EMPLOYER]: Illustrations.ReceiptUpload,
    [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: Illustrations.Abacus,
    [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: Illustrations.PiggyBank,
    [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: Illustrations.SplitBill,
    [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: Illustrations.Binoculars,
};

function BaseOnboardingPurpose({shouldUseNativeStyles, shouldEnableMaxHeight, route}: BaseOnboardingPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    const theme = useTheme();
    const [onboardingErrorMessage, onboardingErrorMessageResult] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE);

    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    const paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;

    const [customChoices = []] = useOnyx(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES);

    const onboardingChoices = getOnboardingChoices(customChoices);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isPrivateDomain = !!session?.email && !LoginUtils.isEmailPublicDomain(session?.email);

    const menuItems: MenuItemProps[] = onboardingChoices.map((choice) => {
        const translationKey = `onboarding.purpose.${choice}` as const;
        return {
            key: translationKey,
            title: translate(translationKey),
            icon: menuIcons[choice],
            displayInDefaultIconColor: true,
            iconWidth: variables.menuIconSize,
            iconHeight: variables.menuIconSize,
            iconStyles: [styles.mh3],
            wrapperStyle: [styles.purposeMenuItem],
            numberOfLinesTitle: 0,
            onPress: () => {
                Welcome.setOnboardingPurposeSelected(choice);
                Welcome.setOnboardingErrorMessage('');
                if (choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
                    Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
                    return;
                }
                // If user is joining a private domain but pressed "skip", finish the onboarding at this page
                if (isPrivateDomain) {
                    Report.completeOnboarding(
                        choice,
                        CONST.ONBOARDING_MESSAGES[choice],
                        onboardingPolicyID,
                    );
            
                    Welcome.setOnboardingAdminsChatReportID();
                    Welcome.setOnboardingPolicyID(onboardingPolicyID);
            
                    Navigation.dismissModal();
            
                    // Only navigate to concierge chat when central pane is visible
                    // Otherwise stay on the chats screen.
                    if (!shouldUseNarrowLayout && !route.params?.backTo) {
                        Report.navigateToConciergeChat();
                    }

                }
                Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
            },
        };
    });
    const isFocused = useIsFocused();

    const handleOuterClick = useCallback(() => {
        Welcome.setOnboardingErrorMessage(translate('onboarding.errorSelection'));
    }, [translate]);

    const onboardingLocalRef = useRef<TOnboardingRef>(null);
    useImperativeHandle(isFocused ? OnboardingRefManager.ref : onboardingLocalRef, () => ({handleOuterClick}), [handleOuterClick]);

    if (isLoadingOnyxValue(onboardingErrorMessageResult)) {
        return null;
    }
    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8, safeAreaPaddingBottomStyle]}>
                    <View style={onboardingIsMediumOrLargerScreenWidth && styles.mh3}>
                        <HeaderWithBackButton
                            shouldShowBackButton={false}
                            iconFill={theme.iconColorfulBackground}
                            progressBarPercentage={isPrivateDomain ? 20 : 25} // TODO adjust if skipped for private domain
                        />
                    </View>
                    <ScrollView style={[styles.flex1, styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, paddingHorizontal]}>
                        <View style={styles.flex1}>
                            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                                <Text style={styles.textHeadlineH1}>{translate('onboarding.purpose.title')} </Text>
                            </View>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </ScrollView>
                    <View style={[styles.w100, styles.mb5, styles.mh0, paddingHorizontal]}>
                        <FormHelpMessage message={onboardingErrorMessage} />
                    </View>
                    {isSmallScreenWidth && <OfflineIndicator />}
                </View>
            )}
        </SafeAreaConsumer>
    );
}

BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';

export default BaseOnboardingPurpose;

export type {BaseOnboardingPurposeProps};
