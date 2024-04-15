import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAdminEmailList} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';

function QuickBooksExportPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {data, config} = policy?.connections?.quickbooksOnline ?? {};
    const exporters = getAdminEmailList(policy);

    // const policyID = policy?.id ?? '';
    const sections = useMemo(
        () =>
            exporters?.map((vendor) => ({
                value: vendor.email,
                text: vendor.email,
                keyForList: vendor.email,
                isSelected: config?.export?.exporter === vendor.email,
            })) ?? [],
        [config?.export?.exporter, data?.vendors],
    );

    const updateMode = useCallback((mode: {value?: string}) => {
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
