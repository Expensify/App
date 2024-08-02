import React from 'react';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NetSuiteCustomFieldMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function MappingStep({importCustomField, customSegmentType}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    let titleKey;
    if (importCustomField === CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS) {
        titleKey = 'workspace.netsuite.import.importCustomFields.customLists.addForm.mappingTitle';
    } else {
        const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
        titleKey = `workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}MappingTitle`;
    }

    return (
        <>
            <Text style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate(titleKey as TranslationPaths)}</Text>
            <Text style={[styles.ph5, styles.mb3]}>{translate(`workspace.netsuite.import.importCustomFields.chooseOptionBelow`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomFieldMappingPicker}
                inputID={INPUT_IDS.MAPPING}
            />
        </>
    );
}

MappingStep.displayName = 'MappingStep';
export default MappingStep;
