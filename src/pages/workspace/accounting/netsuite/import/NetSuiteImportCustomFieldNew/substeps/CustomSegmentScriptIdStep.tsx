import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.SCRIPT_ID];
function CustomSegmentScriptIdStep({customSegmentType, onNext, isEditing}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;

    const fieldLabel = translate(
        `workspace.netsuite.import.importCustomFields.customSegments.fields.${
            customSegmentRecordType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT ? 'scriptID' : 'customRecordScriptID'
        }`,
    );

    const handleSubmit = useNetSuiteImportAddCustomSegmentFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
            submitFlexEnabled
            shouldUseScrollView
        >
            <View style={styles.ph5}>
                <Text style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>
                    {translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}ScriptIDTitle` as TranslationPaths)}
                </Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.SCRIPT_ID}
                    label={fieldLabel}
                    aria-label={fieldLabel}
                    role={CONST.ROLE.PRESENTATION}
                    spellCheck={false}
                    ref={inputCallbackRef}
                />
                <View style={[styles.flex1, styles.mv3, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                    <RenderHTML
                        html={`<comment>${Parser.replace(
                            translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}ScriptIDFooter` as TranslationPaths),
                        )}</comment>`}
                    />
                </View>
            </View>
        </FormProvider>
    );
}

CustomSegmentScriptIdStep.displayName = 'CustomSegmentScriptIdStep';
export default CustomSegmentScriptIdStep;
