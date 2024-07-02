import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getReportFieldInitialValue, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldsUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditReportFieldPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT>;

function EditReportFieldPage({
    policy,
    route: {
        params: {policyID, reportFieldName},
    },
}: EditReportFieldPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const reportField = useMemo(() => Object.values(policy?.fieldList ?? {}).find((field) => field.name === reportFieldName) ?? null, [policy, reportFieldName]);

    if (!reportField) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={styles.defaultModalContainer}
                testID={EditReportFieldPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={reportField.name}
                    onBackButtonPress={Navigation.goBack}
                />

                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={reportField.name}
                    description={translate('common.name')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_REPORT_FIELD_NAME.getRoute(`${policyID}`, reportFieldName))}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={Str.recapitalize(translate(getReportFieldTypeTranslationKey(reportField.type)))}
                    description={translate('common.type')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_REPORT_FIELD_TYPE.getRoute(`${policyID}`, reportFieldName))}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={getReportFieldInitialValue(reportField)}
                    description={translate('common.initialValue')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_REPORT_FIELD_INITIAL_VALUE.getRoute(`${policyID}`, reportFieldName))}
                />

                {reportField.type === CONST.REPORT_FIELD_TYPES.LIST && (
                    <MenuItemWithTopDescription
                        description={translate('workspace.reportFields.listValues')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_LIST_VALUES.getRoute(policyID))}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditReportFieldPage.displayName = 'EditReportFieldPage';

export default withPolicyAndFullscreenLoading(EditReportFieldPage);
