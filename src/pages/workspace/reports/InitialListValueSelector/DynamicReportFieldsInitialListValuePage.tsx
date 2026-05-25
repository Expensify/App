import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import ReportFieldsInitialListValuePicker from './ReportFieldsInitialListValuePicker';

function DynamicReportFieldsInitialListValuePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_REPORT_FIELDS_INITIAL_LIST_VALUE.path);

    const currentValue = formDraft?.[INPUT_IDS.INITIAL_VALUE] ?? '';

    const onValueSelected = (value: string) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {
            [INPUT_IDS.INITIAL_VALUE]: currentValue === value ? '' : value,
        });
        Navigation.goBack(backPath);
    };

    return (
        <ScreenWrapper
            style={styles.pb0}
            includePaddingTop={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={DynamicReportFieldsInitialListValuePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.initialValue')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <View style={[styles.ph5, styles.pb4]}>
                <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listValuesInputSubtitle')}</Text>
            </View>
            <ReportFieldsInitialListValuePicker
                listValues={formDraft?.[INPUT_IDS.LIST_VALUES] ?? []}
                disabledOptions={formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []}
                value={currentValue}
                onValueChange={onValueSelected}
            />
        </ScreenWrapper>
    );
}

DynamicReportFieldsInitialListValuePage.displayName = 'DynamicReportFieldsInitialListValuePage';
export default DynamicReportFieldsInitialListValuePage;
