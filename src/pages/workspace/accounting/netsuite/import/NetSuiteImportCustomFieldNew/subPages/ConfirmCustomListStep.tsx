import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function ConfirmCustomListStep({onMove, netSuiteCustomFieldFormValues: values, onNext}: CustomFieldSubPageWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true});

    const fieldNames = [INPUT_IDS.LIST_NAME, INPUT_IDS.TRANSACTION_FIELD_ID, INPUT_IDS.MAPPING];

    if (!values.mapping) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <View style={[styles.flex1, styles.mt3, bottomSafeAreaPaddingStyle]}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('workspace.common.letsDoubleCheck')}</Text>
            {fieldNames.map((fieldName, index) => (
                <MenuItemWithTopDescription
                    key={fieldName}
                    description={translate(`workspace.netsuite.import.importCustomFields.customLists.fields.${fieldName}` as TranslationPaths)}
                    title={
                        fieldName === INPUT_IDS.MAPPING && values[fieldName]
                            ? translate(`workspace.netsuite.import.importTypes.${values[fieldName]}.label` as TranslationPaths)
                            : values[fieldName]
                    }
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

export default ConfirmCustomListStep;
