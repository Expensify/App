import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {SubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

function NetSuiteTokenSetupContent({onNext, screenIndex}: SubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const stepKeys = CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_KEYS;
    const currentStepKey = stepKeys[(screenIndex ?? 0) as keyof typeof stepKeys];

    const titleKey = `workspace.netsuite.tokenInput.formSteps.${currentStepKey}.title` as TranslationPaths;
    const description = `workspace.netsuite.tokenInput.formSteps.${currentStepKey}.description` as TranslationPaths;

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate(titleKey)}</Text>
            <View style={[styles.flex1, styles.mb3, styles.ph5]}>
                <RenderHTML html={`<comment><muted-text>${Parser.replace(translate(description))}</muted-text></comment>`} />
            </View>
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.next')}
                />
            </FixedFooter>
        </View>
    );
}

export default NetSuiteTokenSetupContent;
