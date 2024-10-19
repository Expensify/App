import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
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

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text>
            <MenuItemWithTopDescription
                description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${INPUT_IDS.LIST_NAME}` as TranslationPaths)}
                title={values[INPUT_IDS.LIST_NAME]}
                shouldShowRightIcon
                onPress={() => {
                    onMove(CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER);
                }}
            />
            <MenuItemWithTopDescription
                description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${INPUT_IDS.TRANSACTION_FIELD_ID}` as TranslationPaths)}
                title={values[INPUT_IDS.TRANSACTION_FIELD_ID]}
                shouldShowRightIcon
                onPress={() => {
                    onMove(CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.TRANSACTION_FIELD_ID);
                }}
            />
            <MenuItemWithTopDescription
                description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${INPUT_IDS.MAPPING}` as TranslationPaths)}
                title={translate(`workspace.netsuite.import.importTypes.${values[INPUT_IDS.MAPPING]}.label` as TranslationPaths)}
                shouldShowRightIcon
                onPress={() => {
                    onMove(CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.MAPPING);
                }}
            />
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
