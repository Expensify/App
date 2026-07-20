import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {ReportFieldItemType} from '@pages/workspace/reports/ReportFieldTypePicker';
import ReportFieldTypePicker from '@pages/workspace/reports/ReportFieldTypePicker';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type FieldsTypeSelectorPageProps = {
    policyID: string;
    currentType?: PolicyReportFieldType;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    createRoute: Route;
    subtitleKey: TranslationPaths;
    testID: string;
};

function getDefaultInitialValueForReportFieldType(type: PolicyReportFieldType): string {
    if (type === CONST.REPORT_FIELD_TYPES.DATE) {
        return DateUtils.extractDate(new Date().toString());
    }
    if (type === CONST.REPORT_FIELD_TYPES.FORMULA) {
        return '{report:id}';
    }
    return '';
}

function FieldsTypeSelectorPage({policyID, currentType, featureName, createRoute, subtitleKey, testID}: FieldsTypeSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const selectType = (item: ReportFieldItemType) => {
        if (item.value !== currentType) {
            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM, {
                [INPUT_IDS.TYPE]: item.value,
                [INPUT_IDS.INITIAL_VALUE]: getDefaultInitialValueForReportFieldType(item.value),
            });
        }
        Navigation.goBack(createRoute);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
            >
                <HeaderWithBackButton
                    title={translate('common.type')}
                    onBackButtonPress={() => Navigation.goBack(createRoute)}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate(subtitleKey)}</Text>
                </View>
                <ReportFieldTypePicker
                    defaultValue={currentType}
                    onOptionSelected={selectType}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FieldsTypeSelectorPage;
