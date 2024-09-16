import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function CustomSegmentNameStep({customSegmentType}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customSegments.fields.segmentName`);

    const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;

    return (
        <View style={styles.ph5}>
            <Text style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>
                {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}NameTitle`)}
            </Text>
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.SEGMENT_NAME}
                label={fieldLabel}
                aria-label={fieldLabel}
                role={CONST.ROLE.PRESENTATION}
                spellCheck={false}
                ref={inputCallbackRef}
            />
            <View style={[styles.flex1, styles.mv3, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                <RenderHTML
                    html={`<comment>${Parser.replace(translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}NameFooter`))}</comment>`}
                />
            </View>
        </View>
    );
}

CustomSegmentNameStep.displayName = 'CustomSegmentNameStep';
export default CustomSegmentNameStep;
