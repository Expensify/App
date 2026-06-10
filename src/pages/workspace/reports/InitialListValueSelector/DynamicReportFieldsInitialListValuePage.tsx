import React, {useEffect} from 'react';
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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ReportFieldsInitialListValuePicker from './ReportFieldsInitialListValuePicker';

type DynamicReportFieldsInitialListValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_REPORT_FIELDS_INITIAL_LIST_VALUE>;

function DynamicReportFieldsInitialListValuePage({
    policy,
    route: {
        params: {policyID},
    },
}: DynamicReportFieldsInitialListValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft, formDraftMetadata] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_REPORT_FIELDS_INITIAL_LIST_VALUE.path);

    const currentValue = formDraft?.[INPUT_IDS.INITIAL_VALUE] ?? '';
    const listValues = formDraft?.[INPUT_IDS.LIST_VALUES] ?? [];

    // When this page is reached via deeplink or restored after a page refresh, the parent CreateReportFieldsPage resets
    // the create-field draft on mount, leaving no list values to choose from. In that case, return to the Add field
    // page instead of stranding the user on an empty picker.
    useEffect(() => {
        if (isLoadingOnyxValue(formDraftMetadata) || listValues.length > 0) {
            return;
        }
        Navigation.goBack(backPath);
    }, [backPath, formDraftMetadata, listValues.length]);

    const onValueSelected = (value: string) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {
            [INPUT_IDS.INITIAL_VALUE]: currentValue === value ? '' : value,
        });
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DynamicReportFieldsInitialListValuePage"
            >
                <HeaderWithBackButton
                    title={translate('common.initialValue')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listValuesInputSubtitle')}</Text>
                </View>
                <ReportFieldsInitialListValuePicker
                    listValues={listValues}
                    disabledOptions={formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []}
                    value={currentValue}
                    onValueChange={onValueSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(DynamicReportFieldsInitialListValuePage);
