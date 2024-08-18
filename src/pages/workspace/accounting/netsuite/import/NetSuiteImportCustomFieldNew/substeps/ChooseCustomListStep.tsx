import React from 'react';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ChooseCustomListStep({policy}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <Text style={[styles.mb3, styles.ph5, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.listNameTitle`)}</Text>
            <InputWrapper
                InputComponent={NetSuiteCustomListPicker}
                inputID={INPUT_IDS.LIST_NAME}
                policy={policy}
                internalIDInputID={INPUT_IDS.INTERNAL_ID}
            />
        </>
    );
}

ChooseCustomListStep.displayName = 'ChooseCustomListStep';
export default ChooseCustomListStep;
