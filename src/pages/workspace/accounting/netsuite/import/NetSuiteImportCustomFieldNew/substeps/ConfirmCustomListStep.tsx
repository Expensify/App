import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NetSuiteMenuWithTopDescriptionForm from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteMenuWithTopDescriptionForm';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ConfirmCustomListStep({onMove}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const fieldNames = [INPUT_IDS.LIST_NAME, INPUT_IDS.TRANSACTION_FIELD_ID, INPUT_IDS.MAPPING];

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text>
            {fieldNames.map((fieldName, index) => (
                <InputWrapper
                    InputComponent={NetSuiteMenuWithTopDescriptionForm}
                    inputID={fieldName}
                    key={fieldName}
                    description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${fieldName}` as TranslationPaths)}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(index);
                    }}
                    valueRenderer={(value) => (fieldName === INPUT_IDS.MAPPING && value ? translate(`workspace.netsuite.import.importTypes.${value}.label` as TranslationPaths) : value)}
                />
            ))}
        </View>
    );
}

ConfirmCustomListStep.displayName = 'ConfirmCustomListStep';
export default ConfirmCustomListStep;
