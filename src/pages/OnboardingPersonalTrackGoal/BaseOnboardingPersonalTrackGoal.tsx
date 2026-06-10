import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoCreateTrackWorkspace from '@hooks/useAutoCreateTrackWorkspace';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {setOnboardingPersonalTrackGoal} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {BaseOnboardingPersonalTrackGoalProps} from './types';

const personalTrackGoalOptions = Object.values(CONST.ONBOARDING_PERSONAL_TRACK_GOALS);

function BaseOnboardingPersonalTrackGoal({shouldUseNativeStyles, route}: BaseOnboardingPersonalTrackGoalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [somethingElseText, setSomethingElseText] = useState('');
    const [inputError, setInputError] = useState('');
    const illustrations = useMemoizedLazyIllustrations(['RealEstate', 'HouseMoney', 'TargetWithArrow', 'Binoculars']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [personalTrackGoal, personalTrackGoalMetadata] = useOnyx(ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL);
    const autoCreateTrackWorkspace = useAutoCreateTrackWorkspace();
    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;

    const isSomethingElseSelected = selectedGoal === CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE;

    // Restore a previously made selection (e.g. after the user refreshes the next step and navigates back) from the persisted Onyx value.
    // Predefined goals are stored as their constant, while "Something else" stores the free text the user typed.
    const hasRestoredSelection = useRef(false);
    useEffect(() => {
        if (hasRestoredSelection.current || personalTrackGoalMetadata.status !== 'loaded' || !personalTrackGoal) {
            return;
        }
        hasRestoredSelection.current = true;
        if (personalTrackGoalOptions.some((option) => option === personalTrackGoal)) {
            setSelectedGoal(personalTrackGoal);
            return;
        }
        setSelectedGoal(CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE);
        setSomethingElseText(personalTrackGoal);
    }, [personalTrackGoal, personalTrackGoalMetadata.status]);

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

    const menuIcons = {
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING]: illustrations.RealEstate,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.HOUSEHOLD_TRACKING]: illustrations.HouseMoney,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SIDEPROJECT_TRACKING]: illustrations.TargetWithArrow,
        [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE]: illustrations.Binoculars,
    };

    const paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;

    return (
        <ScreenWrapper
            testID="BaseOnboardingPersonalTrackGoal"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                stepCounter={onboardingStep?.stepCounter}
                progressBarPercentage={onboardingStep?.progressBarPercentage}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
                }}
                shouldDisplayHelpButton={false}
            />
            <ScrollView
                style={[styles.flex1, styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, paddingHorizontal]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.flex1}>
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
                                    setSelectedGoal(goal);
                                    setInputError('');
                                    if (goal !== CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE) {
                                        completeTrackGoalSelection(goal);
                                    }
                                }}
                            />
                        );
                    })}
                    {isSomethingElseSelected && (
                        <View style={styles.mt4}>
                            <TextInput
                                autoFocus
                                accessibilityLabel={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                                label={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                                value={somethingElseText}
                                onChangeText={(text) => {
                                    setSomethingElseText(text);
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
                </View>
            </ScrollView>
            {isSomethingElseSelected && (
                <View style={[styles.w100, styles.mb5, styles.mh0, paddingHorizontal]}>
                    <Button
                        success
                        large
                        text={translate('common.continue')}
                        onPress={() => {
                            if (!somethingElseText.trim()) {
                                setInputError(translate('common.error.fieldRequired'));
                                return;
                            }
                            completeTrackGoalSelection(somethingElseText.trim());
                        }}
                        pressOnEnter
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

export default BaseOnboardingPersonalTrackGoal;
