import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

function NetSuiteTokenInputStaticContent({onNext, screenIndex}: SubStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const stepKeys = CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_KEYS;
    const currentStepKey = stepKeys[(screenIndex ?? 0) as keyof typeof stepKeys];

    const titleKey = `workspace.netsuite.tokenInput.formSteps.${currentStepKey}.title` as TranslationPaths;
    const description = `workspace.netsuite.tokenInput.formSteps.${currentStepKey}.description` as TranslationPaths;

    return (
        <View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate(titleKey)}</Text>
            <Text style={[styles.mb3, styles.textSupporting]}>{translate(description)}</Text>
            <Button
                success
                large
                style={[styles.w100, styles.mv5]}
                onPress={onNext}
                text={translate('common.next')}
            />
        </View>
    );
}

NetSuiteTokenInputStaticContent.displayName = 'NetSuiteTokenInputStaticContent';
export default NetSuiteTokenInputStaticContent;
