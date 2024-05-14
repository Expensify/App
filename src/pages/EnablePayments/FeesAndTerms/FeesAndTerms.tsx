import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import FeesStep from './substeps/FeesStep';
import TermsStep from './substeps/TermsStep';

const termsAndFeesSubsteps: Array<React.ComponentType<SubStepProps>> = [FeesStep, TermsStep];

function FeesAndTerms() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = () => {};
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: termsAndFeesSubsteps, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            // TODO: temporary for refactor https://github.com/Expensify/App/issues/36648
            Navigation.navigate(ROUTES.SETTINGS_WALLET);
            return;
        }
        prevScreen();
    };

    return (
        <ScreenWrapper
            testID={FeesAndTerms.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('termsStep.headerTitleRefactor')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={3}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

FeesAndTerms.displayName = 'TermsAndFees';

export default FeesAndTerms;
