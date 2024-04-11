import React, {useCallback, useMemo} from 'react';
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

const draft = [
    {name: '+14153166423@expensify.sms', currency: 'USD', id: '94', email: '+14153166423@expensify.sms'},
    {name: 'Account Maintenance Fee', currency: 'USD', id: '141', email: 'alberto@expensify213.com'},
    {name: 'Admin Test', currency: 'USD', id: '119', email: 'admin@qbocard.com'},
    {name: 'Alberto Gonzalez-Cela', currency: 'USD', id: '104', email: 'alberto@expensify.com'},
    {name: 'Aldo test QBO2 QBO2 Last name', currency: 'USD', id: '140', email: 'admin@qbo.com'},
];

function QuickBooksExportPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {data, config} = policy?.connections?.quickbooksOnline ?? {};
    // const policyID = policy?.id ?? '';
    const sections = useMemo(
        () =>
            (data?.vendors ?? draft)?.map((vendor) => ({
                value: vendor.email,
                text: vendor.email,
                keyForList: vendor.email,
                isSelected: config?.export?.exporter === vendor.email,
            })) ?? [],
        [config?.export?.exporter, data?.vendors],
    );

    const updateMode = useCallback((mode: {value: string}) => {
        // TODO add API call for change
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickBooksExportPreferredExporterPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.preferredExporter')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportPreferredExporterNote')}</Text>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportPreferredExporterSubNote')}</Text>
                <SelectionList
                    sections={[{data: sections}]}
                    ListItem={RadioListItem}
                    onSelectRow={updateMode}
                    initiallyFocusedOptionKey={sections.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickBooksExportPreferredExporterPage.displayName = 'QuickBooksExportPreferredExporterPage';

export default withPolicy(QuickBooksExportPreferredExporterPage);
