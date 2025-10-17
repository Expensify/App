import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useImperativeHandle, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import type {TOnboardingRef} from '@libs/OnboardingRefManager';
import variables from '@styles/variables';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingErrorMessage, setOnboardingPurposeSelected} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {BaseOnboardingPurposeProps} from './types';

const selectableOnboardingChoices = Object.values(CONST.SELECTABLE_ONBOARDING_CHOICES);

function getOnboardingChoices(customChoices: OnboardingPurpose[]) {
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
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const {onboardingMessages} = useOnboardingMessages();

    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;

    const theme = useTheme();
    const [onboardingErrorMessage, onboardingErrorMessageResult] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {canBeMissing: true});

    const paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;

    const [customChoices = getEmptyArray<OnboardingPurpose>()] = useOnyx(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, {canBeMissing: true});

    const onboardingChoices = getOnboardingChoices(customChoices);

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
                setOnboardingPurposeSelected(choice);
                setOnboardingErrorMessage('');
                if (choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
                    Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
                    return;
                }

                if (isPrivateDomainAndHasAccessiblePolicies && personalDetailsForm?.firstName) {
                    completeOnboarding({
                        engagementChoice: choice,
                        onboardingMessage: onboardingMessages[choice],
                        firstName: personalDetailsForm.firstName,
                        lastName: personalDetailsForm.lastName,
                        adminsChatReportID: onboardingAdminsChatReportID ?? undefined,
                        onboardingPolicyID,
                    });

                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
                    });

                    return;
                }

                Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
            },
        };
    });
    const isFocused = useIsFocused();

    const handleOuterClick = useCallback(() => {
        setOnboardingErrorMessage(translate('onboarding.errorSelection'));
    }, [translate]);

    const onboardingLocalRef = useRef<TOnboardingRef>(null);
    useImperativeHandle(isFocused ? OnboardingRefManager.ref : onboardingLocalRef, () => ({handleOuterClick}), [handleOuterClick]);

    if (isLoadingOnyxValue(onboardingErrorMessageResult)) {
        return null;
    }
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPurpose"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
        >
            <View style={onboardingIsMediumOrLargerScreenWidth && styles.mh3}>
                <HeaderWithBackButton
                    shouldShowBackButton={false}
                    iconFill={theme.iconColorfulBackground}
                    progressBarPercentage={isPrivateDomainAndHasAccessiblePolicies ? 60 : 20}
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
        </ScreenWrapper>
    );
}

BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';

export default BaseOnboardingPurpose;
