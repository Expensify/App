import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import * as FormActions from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ChooseCustomListStep({policy, onNext}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [formDraftValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT);

    return (
        <>
            <Text style={[styles.mb3, styles.ph5, styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.import.importCustomFields.customLists.addForm.listNameTitle`)}</Text>
            <NetSuiteCustomListPicker
                policy={policy}
                onInputChange={(listName, internalID) => {
                    FormActions.setDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM, {listName, internalID});
                    onNext();
                }}
                value={formDraftValues?.[INPUT_IDS.LIST_NAME]}
            />
        </>
    );
}

ChooseCustomListStep.displayName = 'ChooseCustomListStep';
export default ChooseCustomListStep;
