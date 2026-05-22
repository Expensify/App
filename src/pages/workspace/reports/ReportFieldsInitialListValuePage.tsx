import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import ReportFieldsInitialListValuePicker from './InitialListValueSelector/ReportFieldsInitialListValuePicker';

type ReportFieldsInitialListValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_INITIAL_LIST_VALUE>;

function ReportFieldsInitialListValuePage({
    policy,
    route: {
        params: {policyID},
    },
}: ReportFieldsInitialListValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const submitListValueUpdate = (value: string) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {[INPUT_IDS.INITIAL_VALUE]: formDraft?.[INPUT_IDS.INITIAL_VALUE] === value ? '' : value});
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="ReportFieldsInitialListValuePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.initialValue')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listValuesInputSubtitle')}</Text>
                </View>
                <ReportFieldsInitialListValuePicker
                    listValues={formDraft?.[INPUT_IDS.LIST_VALUES] ?? []}
                    disabledOptions={formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []}
                    value={formDraft?.[INPUT_IDS.INITIAL_VALUE] ?? ''}
                    onValueChange={submitListValueUpdate}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsInitialListValuePage);
