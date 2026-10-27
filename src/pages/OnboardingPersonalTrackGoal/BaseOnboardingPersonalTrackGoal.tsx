import Button from '@components/Button';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import OnboardingHeader from '@components/OnboardingHeader';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoCreateTrackWorkspace from '@hooks/useAutoCreateTrackWorkspace';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import scrollFocusedInputToTop from '@libs/scrollFocusedInputToTop';

import variables from '@styles/variables';

import {setOnboardingPersonalTrackGoal} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingPersonalTrackGoalProps} from './types';

const personalTrackGoalOptions = Object.values(CONST.ONBOARDING_PERSONAL_TRACK_GOALS);

function BaseOnboardingPersonalTrackGoal({shouldUseNativeStyles, route}: BaseOnboardingPersonalTrackGoalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const shouldFooterBeInsideScrollView = useShouldFooterBeInsideList();
    const [selectedGoalOverride, setSelectedGoalOverride] = useState<string | null>(null);
    const [somethingElseTextOverride, setSomethingElseTextOverride] = useState<string | null>(null);
    const [inputError, setInputError] = useState('');
    const [shouldScrollToSomethingElseInput, setShouldScrollToSomethingElseInput] = useState(false);
    const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const scrollContentRef = useRef<View>(null);
    const inputRef = useRef<AnimatedTextInputRef>(null);
    const illustrations = useMemoizedLazyIllustrations(['RealEstate', 'HouseMoney', 'TargetWithArrow', 'Binoculars']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [personalTrackGoal] = useOnyx(ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL);
    const autoCreateTrackWorkspace = useAutoCreateTrackWorkspace();
    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;

    // Restore a previously made selection (e.g. after the user refreshes the next step and navigates back) from the persisted Onyx value.
    // Predefined goals are stored as their constant; "Something else" stores the free text the user typed.
    const restoredGoal = personalTrackGoal ? (personalTrackGoalOptions.find((option) => option === personalTrackGoal) ?? CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE) : null;
    const selectedGoal = selectedGoalOverride ?? restoredGoal;
    const somethingElseText = somethingElseTextOverride ?? (restoredGoal === CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE ? (personalTrackGoal ?? '') : '');

    const isSomethingElseSelected = selectedGoal === CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE;

    // Private-domain users already entered their name before Purpose, so PERSONAL_DETAILS isn't part of their flow.
    // Mirror BaseOnboardingPurpose and complete the track workspace directly instead of sending them back to the name screen.
    const completeTrackGoalSelection = (goal: string) => {
        setOnboardingPersonalTrackGoal(goal);
        if (isPrivateDomainAndHasAccessiblePolicies && personalDetailsForm?.firstName) {
            autoCreateTrackWorkspace(personalDetailsForm.firstName, personalDetailsForm.lastName ?? '', CONST.ONBOARDING_CHOICES.TRACK_PERSONAL, goal);
            return;
        }
        Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
    };

    const submitSomethingElseGoal = () => {
        if (!somethingElseText.trim()) {
            setInputError(translate('common.error.fieldRequired'));
            return;
        }
        completeTrackGoalSelection(somethingElseText.trim());
    };

    const handleContentSizeChange = () => {
        if (!shouldScrollToSomethingElseInput) {
            return;
        }

        scrollViewRef.current?.scrollToEnd({animated: false});
        setShouldScrollToSomethingElseInput(false);
    };

    const menuIcons = {
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING]: illustrations.RealEstate,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.HOUSEHOLD_TRACKING]: illustrations.HouseMoney,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SIDEPROJECT_TRACKING]: illustrations.TargetWithArrow,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE]: illustrations.Binoculars,
    };

    const paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;

    const continueButton = (
        <View style={[styles.w100, styles.mb5, styles.mh0, !shouldFooterBeInsideScrollView ? paddingHorizontal : undefined]}>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={submitSomethingElseGoal}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.continue')}</Button.Text>
            </Button>
        </View>
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingPersonalTrackGoal"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <CollapsibleHeaderOnKeyboard>
                <OnboardingHeader
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
                    }}
                />
            </CollapsibleHeaderOnKeyboard>
            <ScrollView
                ref={scrollViewRef}
                onLayout={() => scrollFocusedInputToTop(scrollViewRef, scrollContentRef, inputRef)}
                style={[styles.flex1, styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, paddingHorizontal]}
                onContentSizeChange={handleContentSizeChange}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    ref={scrollContentRef}
                    style={styles.flex1}
                >
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text
                            style={styles.textHeadlineH1}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {translate('onboarding.personalTrackGoal.title')}
                        </Text>
                    </View>
                    {personalTrackGoalOptions.map((goal) => {
                        const translationKey = `onboarding.personalTrackGoal.${goal}` as const;
                        const isSelected = goal === selectedGoal;
                        return (
                            <MenuItem
                                key={translationKey}
                                title={translate(translationKey)}
                                icon={menuIcons[goal]}
                                displayInDefaultIconColor
                                iconWidth={variables.menuIconSize}
                                iconHeight={variables.menuIconSize}
                                iconStyles={[styles.mh3]}
                                wrapperStyle={[styles.purposeMenuItem, isSelected && styles.activeComponentBG]}
                                numberOfLinesTitle={0}
                                shouldShowRightIcon={isSelected}
                                iconRight={expensifyIcons.Checkmark}
                                success={isSelected}
                                shouldRemoveHoverBackground={isSelected}
                                onPress={() => {
                                    setSelectedGoalOverride(goal);
                                    setInputError('');
                                    setShouldScrollToSomethingElseInput(goal === CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE);
                                    if (goal !== CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE) {
                                        completeTrackGoalSelection(goal);
                                    }
                                }}
                            />
                        );
                    })}
                    {isSomethingElseSelected && (
                        <View style={[styles.mt4, styles.mb5]}>
                            <TextInput
                                ref={inputRef}
                                autoFocus
                                accessibilityLabel={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                                label={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                                value={somethingElseText}
                                onChangeText={(text) => {
                                    setSomethingElseTextOverride(text);
                                    setInputError('');
                                }}
                            />
                            {!!inputError && (
                                <FormHelpMessage
                                    style={[styles.ph1, styles.mt2]}
                                    isError
                                    message={inputError}
                                />
                            )}
                        </View>
                    )}

                    {isSomethingElseSelected && shouldFooterBeInsideScrollView && continueButton}
                </View>
            </ScrollView>
            {isSomethingElseSelected && !shouldFooterBeInsideScrollView && continueButton}
        </ScreenWrapper>
    );
}

export default BaseOnboardingPersonalTrackGoal;
