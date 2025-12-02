import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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

function BaseOnboardingPurpose({shouldUseNativeStyles, shouldEnableMaxHeight, route}: BaseOnboardingPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Abacus', 'Binoculars', 'ReceiptUpload', 'PiggyBank', 'SplitBill'] as const);

    const menuIcons = useMemo(
        () => ({
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: illustrations.ReceiptUpload,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: illustrations.Abacus,
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: illustrations.PiggyBank,
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: illustrations.SplitBill,
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: illustrations.Binoculars,
        }),
        [illustrations.Abacus, illustrations.Binoculars, illustrations.ReceiptUpload, illustrations.PiggyBank, illustrations.SplitBill],
    );
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const {onboardingMessages} = useOnboardingMessages();

    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;

    const theme = useTheme();
    const [onboardingErrorMessage, onboardingErrorMessageResult] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, {canBeMissing: true});
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
                setOnboardingErrorMessage(null);
                if (choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
                    Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
                    return;
                }

                if (isPrivateDomainAndHasAccessiblePolicies && personalDetailsForm?.firstName) {
                    if (choice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
                        Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE.getRoute(route.params?.backTo));
                        return;
                    }
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
        setOnboardingErrorMessage('onboarding.errorSelection');
    }, []);

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
                <FormHelpMessage message={onboardingErrorMessage ? translate(onboardingErrorMessage) : undefined} />
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';

export default BaseOnboardingPurpose;
