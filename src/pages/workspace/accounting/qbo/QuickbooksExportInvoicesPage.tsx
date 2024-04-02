import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';

function QuickbooksExportInvoicesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // const policyID = policy?.id ?? '';
    const data = [
        {
            value: 'receivable',
            text: translate(`workspace.qbo.receivable`),
            keyForList: 'receivable',
            isSelected: false,
        },
        {
            value: 'archive',
            text: translate(`workspace.qbo.archive`),
            keyForList: 'archive',
            isSelected: false,
        },
    ];

    const updateMode = useCallback((mode: {value: string}) => {
        // TODO add API call for change
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksExportInvoicesPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportInvoices')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportInvoicesDescription')}</Text>
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

QuickbooksExportInvoicesPage.displayName = 'QuickbooksExportInvoicesPage';

export default withPolicy(QuickbooksExportInvoicesPage);
