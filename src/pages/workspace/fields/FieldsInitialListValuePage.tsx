import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ReportFieldsInitialListValuePicker from '@pages/workspace/reports/InitialListValueSelector/ReportFieldsInitialListValuePicker';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type FieldsInitialListValuePageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    backPath: Route;
    subtitleKey: TranslationPaths;
    testID: string;
};

function FieldsInitialListValuePage({policy, policyID, featureName, backPath, subtitleKey, testID}: FieldsInitialListValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft, formDraftMetadata] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const currentValue = formDraft?.[INPUT_IDS.INITIAL_VALUE] ?? '';
    const isLoadingFormDraft = formDraftMetadata.status !== 'loaded';
    const availableListValuesLength = (formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []).filter((disabledListValue) => !disabledListValue).length;
    const shouldRedirectToCreatePage = !isLoadingFormDraft && availableListValuesLength === 0;

    useEffect(() => {
        if (!shouldRedirectToCreatePage) {
            return;
        }
        Navigation.goBack(backPath);
    }, [backPath, shouldRedirectToCreatePage]);

    const selectValue = (value: string) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {
            [INPUT_IDS.INITIAL_VALUE]: currentValue === value ? '' : value,
        });
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={testID}
            >
                <HeaderWithBackButton
                    title={translate('common.initialValue')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                {isLoadingFormDraft || shouldRedirectToCreatePage ? (
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator
                            size="large"
                            reasonAttributes={{context: testID, isLoadingFormDraft: !!isLoadingFormDraft}}
                        />
                    </View>
                ) : (
                    <>
                        <View style={[styles.ph5, styles.pb4]}>
                            <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate(subtitleKey)}</Text>
                        </View>
                        <ReportFieldsInitialListValuePicker
                            listValues={formDraft?.[INPUT_IDS.LIST_VALUES] ?? []}
                            disabledOptions={formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []}
                            value={currentValue}
                            onValueChange={selectValue}
                        />
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FieldsInitialListValuePage;
