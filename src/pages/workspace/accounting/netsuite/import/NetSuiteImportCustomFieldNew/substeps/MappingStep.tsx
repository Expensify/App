import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useNetSuiteCustomFieldAddFormSubmit from '@hooks/useNetSuiteCustomFieldAddFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function MappingStep({onNext, isEditing}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const handleSubmit = useNetSuiteCustomFieldAddFormSubmit({
        fieldIds: [INPUT_IDS.TRANSACTION_FIELD_ID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const [selectedValue, setSelectedValue] = useState();

    const renderSelection = useMemo(() => {
      const options = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

      const selectionData: ImportListItem[] =
          options.map((option) => ({
              text: translate(`workspace.netsuite.import.importTypes.${option}.label`),
              keyForList: option,
              isSelected: fieldValue === option,
              value: option,
              alternateText: translate(`workspace.netsuite.import.importTypes.${option}.description`),
          })) ?? [];

      return (
          customRecord && (
              
          )
      );
  }, [customRecord, fieldName, fieldValue, translate, updateRecord]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1, styles.ph5]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[ styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.mappingTitle`)}</Text>
            <InputWrapper
                InputComponent={<SelectionList
                  onSelectRow={(selected: ImportListItem) =>
                      updateRecord({
                          [fieldName]: selected.value,
                      })
                  }
                  sections={[{data: selectionData}]}
                  ListItem={RadioListItem}
                  initiallyFocusedOptionKey={selectionData?.find((record) => record.isSelected)?.keyForList}
              />}
                inputID={INPUT_IDS.TRANSACTION_FIELD_ID}
                shouldSaveDraft={!isEditing}
                label={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.transactionFieldID`)}
                aria-label={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.transactionFieldID`)}
                role={CONST.ROLE.PRESENTATION}
                spellCheck={false}
            />
        </FormProvider>
    );
}

MappingStep.displayName = 'MappingStep';
export default MappingStep;
