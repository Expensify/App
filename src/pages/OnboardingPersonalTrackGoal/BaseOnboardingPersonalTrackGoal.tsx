import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {setOnboardingPersonalTrackGoal} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {BaseOnboardingPersonalTrackGoalProps} from './types';

type OnboardingTrackGoalListItem = ListItem & {
    keyForList: string;
};

const personalTrackGoalOptions = Object.values(CONST.ONBOARDING_PERSONAL_TRACK_GOALS);

function BaseOnboardingPersonalTrackGoal({shouldUseNativeStyles, route}: BaseOnboardingPersonalTrackGoalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [somethingElseText, setSomethingElseText] = useState('');
    const [error, setError] = useState('');

    const isSomethingElseSelected = selectedGoal === CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE;

    const goalOptions: OnboardingTrackGoalListItem[] = useMemo(
        () =>
            personalTrackGoalOptions.map((goal): OnboardingTrackGoalListItem => {
                return {
                    text: translate(`onboarding.personalTrackGoal.${goal}`),
                    keyForList: goal,
                    isSelected: goal === selectedGoal,
                };
            }),
        [translate, selectedGoal],
    );

    const footerContent = (
        <View>
            {isSomethingElseSelected && (
                <View style={[styles.mb4, onboardingIsMediumOrLargerScreenWidth ? [styles.ph8] : []]}>
                    <TextInput
                        accessibilityLabel={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                        placeholder={translate('onboarding.personalTrackGoal.somethingElsePlaceholder')}
                        value={somethingElseText}
                        onChangeText={(text) => {
                            setSomethingElseText(text);
                            setError('');
                        }}
                    />
                </View>
            )}
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
                text={translate('common.continue')}
                onPress={() => {
                    if (!selectedGoal) {
                        setError(translate('onboarding.errorSelection'));
                        return;
                    }
                    if (isSomethingElseSelected && !somethingElseText.trim()) {
                        setError(translate('onboarding.errorSelection'));
                        return;
                    }
                    const goalValue = isSomethingElseSelected ? somethingElseText.trim() : selectedGoal;
                    setOnboardingPersonalTrackGoal(goalValue);
                    Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
                }}
                pressOnEnter
            />
        </View>
    );

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
                    Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute());
                }}
                shouldDisplayHelpButton={false}
            />
            <Text
                style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('onboarding.personalTrackGoal.title')}
            </Text>
            <SelectionList
                data={goalOptions}
                onSelectRow={(item) => {
                    setSelectedGoal(item.keyForList);
                    setError('');
                }}
                initiallyFocusedItemKey={goalOptions.find((item) => item.keyForList === selectedGoal)?.keyForList}
                shouldUpdateFocusedIndex
                ListItem={SingleSelectListItem}
                footerContent={footerContent}
                style={{listItemWrapperStyle: onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}}
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingPersonalTrackGoal;
