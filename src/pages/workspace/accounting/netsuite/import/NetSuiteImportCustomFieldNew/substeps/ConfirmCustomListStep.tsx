import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ConfirmCustomListStep({onMove, netSuiteCustomFieldFormValues: values, onNext}: CustomFieldSubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const fieldNames = [INPUT_IDS.LIST_NAME, INPUT_IDS.TRANSACTION_FIELD_ID, INPUT_IDS.MAPPING];

    if (!values.mapping) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text>
            {fieldNames.map((fieldName, index) => (
                <MenuItemWithTopDescription
                    description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${fieldName}` as TranslationPaths)}
                    title={values[fieldName]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(index);
                    }}
                />
            ))}
            <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                <Button
                    isDisabled={isOffline}
                    success
                    large
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.confirm')}
                />
            </View>
        </View>
    );
}

ConfirmCustomListStep.displayName = 'ConfirmCustomListStep';
export default ConfirmCustomListStep;
