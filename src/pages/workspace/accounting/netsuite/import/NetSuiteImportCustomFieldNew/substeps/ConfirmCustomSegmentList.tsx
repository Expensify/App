import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NetSuiteMenuWithTopDescriptionForm from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteMenuWithTopDescriptionForm';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ConfirmCustomSegmentStep({onMove, customSegmentType, netSuiteCustomFieldFormValues: values}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const fieldNames = [INPUT_IDS.SEGMENT_NAME, INPUT_IDS.INTERNAL_ID, INPUT_IDS.SCRIPT_ID, INPUT_IDS.MAPPING];

    if (!values.mapping) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text>
            {fieldNames.map((fieldName, index) => (
                <MenuItemWithTopDescription
                    description={translate(
                        `workspace.netsuite.import.importCustomFields.customSegments.fields.${
                            fieldName === INPUT_IDS.SCRIPT_ID && customSegmentType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD
                                ? `${CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD}ScriptID`
                                : `${fieldName}`
                        }` as TranslationPaths,
                    )}
                    title={values[fieldName]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(index + 1);
                    }}
                />
            ))}
        </View>
    );
}

ConfirmCustomSegmentStep.displayName = 'ConfirmCustomSegmentStep';
export default ConfirmCustomSegmentStep;
