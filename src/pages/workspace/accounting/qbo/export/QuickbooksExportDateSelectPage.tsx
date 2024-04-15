import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

function QuickbooksExportDateSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // const policyID = policy?.id ?? '';
    const {exportDate} = policy?.connections?.quickbooksOnline?.config ?? {};
    const data = Object.values(CONST.QUICKBOOKS_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.qbo.${dateType}.label`),
        alternateText: translate(`workspace.qbo.${dateType}.description`),
        keyForList: dateType,
        isSelected: exportDate ? CONST.QUICKBOOKS_EXPORT_DATE[exportDate] === dateType : false,
    }));

    const updateMode = useCallback(
        (mode: {value: string}) => {
            if (exportDate && mode.value === CONST.QUICKBOOKS_EXPORT_DATE[exportDate]) {
                Navigation.goBack();
                return;
            }
            // TODO add API call for change
        },
        [exportDate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksExportDateSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportDate')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDateDescription')}</Text>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={updateMode}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksExportDateSelectPage.displayName = 'QuickbooksExportDateSelectPage';

export default withPolicy(QuickbooksExportDateSelectPage);
