import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
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
import OnboardingRefManager from '@libs/OnboardingRefManager';
import type {TOnboardingRef} from '@libs/OnboardingRefManager';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import type {OnboardingPurposeType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingPurposeOnyxProps, BaseOnboardingPurposeProps} from './types';

const menuIcons = {
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
    const [selectedPurpose, setSelectedPurpose] = useState<OnboardingPurposeType | undefined>(undefined);
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const theme = useTheme();

    useDisableModalDismissOnEscape();

    const PurposeFooterInstance = <OfflineIndicator />;

    useEffect(() => {
        setSelectedPurpose(onboardingPurposeSelected ?? undefined);
    }, [onboardingPurposeSelected]);

    const maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;

    const paddingHorizontal = shouldUseNarrowLayout ? styles.ph8 : styles.ph5;

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

    const saveAndNavigate = useCallback(() => {
        if (selectedPurpose === undefined) {
            return;
        }

        if (selectedPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
            Navigation.navigate(ROUTES.ONBOARDING_WORK);
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS);
    }, [selectedPurpose]);

    const [errorMessage, setErrorMessage] = useState<'onboarding.purpose.errorSelection' | 'onboarding.purpose.errorContinue' | ''>('');

    const menuItems: MenuItemProps[] = Object.values(CONST.ONBOARDING_CHOICES).map((choice) => {
        const translationKey = `onboarding.purpose.${choice}` as const;
        const isSelected = selectedPurpose === choice;
        return {
            key: translationKey,
            title: translate(translationKey),
            icon: menuIcons[choice],
            displayInDefaultIconColor: true,
            iconWidth: variables.menuIconSize,
            iconHeight: variables.menuIconSize,
            iconStyles: [styles.mh3],
            wrapperStyle: [styles.purposeMenuItem, isSelected && styles.purposeMenuItemSelected],
            hoverAndPressStyle: [styles.purposeMenuItemSelected],
            rightComponent: selectedCheckboxIcon,
            shouldShowRightComponent: isSelected,
            onPress: () => {
                Welcome.setOnboardingPurposeSelected(choice);
                setErrorMessage('');
            },
        };
    });
    const isFocused = useIsFocused();

    const handleOuterClick = useCallback(() => {
        if (!selectedPurpose) {
            setErrorMessage('onboarding.purpose.errorSelection');
        } else {
            setErrorMessage('onboarding.purpose.errorContinue');
        }
    }, [selectedPurpose]);

    const onboardingLocalRef = useRef<TOnboardingRef>(null);
    useImperativeHandle(isFocused ? OnboardingRefManager.ref : onboardingLocalRef, () => ({handleOuterClick}), [handleOuterClick]);

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8, safeAreaPaddingBottomStyle]}>
                    <View style={shouldUseNarrowLayout && styles.mh3}>
                        <HeaderWithBackButton
                            shouldShowBackButton={false}
                            iconFill={theme.iconColorfulBackground}
                            progressBarPercentage={25}
                        />
                    </View>
                    <ScrollView style={[styles.flex1, styles.flexGrow1, shouldUseNarrowLayout && styles.mt5, paddingHorizontal]}>
                        <View style={styles.flex1}>
                            <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                                <Text style={styles.textHeadlineH1}>{translate('onboarding.purpose.title')} </Text>
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
                                setErrorMessage('onboarding.purpose.errorSelection');
                                return;
                            }
                            setErrorMessage('');
                            saveAndNavigate();
                        }}
                        message={errorMessage}
                        isAlertVisible={Boolean(errorMessage)}
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

export type {BaseOnboardingPurposeProps};
