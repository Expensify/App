import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteImportAddCustomListFormSubmit from '@hooks/useNetSuiteImportAddCustomListForm';
import useNetSuiteImportAddCustomSegmentFormSubmit from '@hooks/useNetSuiteImportAddCustomSegmentForm';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

const STEP_FIELDS = [INPUT_IDS.TRANSACTION_FIELD_ID];

function TransactionFieldIDStep({onNext, isEditing, netSuiteCustomFieldFormValues}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customLists.fields.transactionFieldID`);

    const handleSubmit = useNetSuiteImportAddCustomListFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
            submitFlexEnabled
            shouldUseScrollView
        >
            <View style={styles.ph5}>
                <Text style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.transactionFieldIDTitle`)}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.TRANSACTION_FIELD_ID}
                    label={fieldLabel}
                    aria-label={fieldLabel}
                    role={CONST.ROLE.PRESENTATION}
                    spellCheck={false}
                    ref={inputCallbackRef}
                    defaultValue={netSuiteCustomFieldFormValues[INPUT_IDS.TRANSACTION_FIELD_ID]}
                />
                <View style={[styles.flex1, styles.mv3, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                    <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.transactionFieldIDFooter`))}</comment>`} />
                </View>
            </View>
        </FormProvider>
    );
}

TransactionFieldIDStep.displayName = 'TransactionFieldIDStep';
export default TransactionFieldIDStep;
