import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {ReportFieldItemType} from '@pages/workspace/reports/ReportFieldTypePicker';
import ReportFieldTypePicker from '@pages/workspace/reports/ReportFieldTypePicker';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

type TypeSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_TYPE_SELECTOR>;

function getDefaultInitialValueForReportFieldType(type: PolicyReportFieldType): string {
    if (type === CONST.REPORT_FIELD_TYPES.DATE) {
        return DateUtils.extractDate(new Date().toString());
    }
    if (type === CONST.REPORT_FIELD_TYPES.FORMULA) {
        return '{report:id}';
    }
    return '';
}

function TypeSelectorPage({
    route: {
        params: {policyID, currentType},
    },
}: TypeSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const onTypeSelected = (item: ReportFieldItemType) => {
        // Only reset the initial value when the type actually changes. Re-selecting the same type
        // would otherwise clobber the user's in-progress initial value with the type's default.
        if (item.value !== currentType) {
            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {
                [INPUT_IDS.TYPE]: item.value,
                [INPUT_IDS.INITIAL_VALUE]: getDefaultInitialValueForReportFieldType(item.value),
            });
        }
        Navigation.goBack(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID));
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
                testID="TypeSelectorPage"
            >
                <HeaderWithBackButton
                    title={translate('common.type')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID))}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.typeInputSubtitle')}</Text>
                </View>
                <ReportFieldTypePicker
                    defaultValue={currentType}
                    onOptionSelected={onTypeSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default TypeSelectorPage;
