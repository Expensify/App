import React, {useMemo, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyReportField} from '@src/types/onyx';
import ReportFieldDate from './ReportFieldDate';
import ReportFieldList from './ReportFieldList';
import ReportFieldText from './ReportFieldText';

function SearchFiltersReportFieldPage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const [values, setValues] = useState<Record<string, string | string[] | null>>({});
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);

    const [fieldList] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: (policies) => {
            const allPolicyReportFields = Object.values(policies ?? {}).reduce<Record<string, PolicyReportField>>((acc, policy) => {
                Object.assign(acc, policy?.fieldList ?? {});
                return acc;
            }, {});

            const nonFormulaReportFields = Object.entries(allPolicyReportFields)
                // JACK_TODO: 'formula' was reverted so the const doesnt exist. This should not be a magic string
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, value]) => value.type !== 'formula')
                .sort(([aKey], [bKey]) => localeCompare(aKey, bKey));

            return Object.fromEntries(nonFormulaReportFields);
        },
    });

    const [fieldValues] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const resetValues = () => {
        setValues({});
    };

    if (selectedField) {
        const fieldType = selectedField.type as 'text' | 'date' | 'dropdown';

        const UpdateReportFieldComponent = {
            [CONST.REPORT_FIELD_TYPES.LIST]: ReportFieldList,
            [CONST.REPORT_FIELD_TYPES.DATE]: ReportFieldDate,
            [CONST.REPORT_FIELD_TYPES.TEXT]: ReportFieldText,
        }[fieldType];

        return (
            <ScreenWrapper
                testID={SearchFiltersReportFieldPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={selectedField.name}
                    onBackButtonPress={() => {
                        setSelectedField(null);
                    }}
                />
                <UpdateReportFieldComponent
                    field={selectedField}
                    values={values}
                    setValues={setValues}
                    close={() => setSelectedField(null)}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchFiltersReportFieldPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.common.reportField')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                {fieldMenuItems.map((field) => (
                    <MenuItem
                        key={field.fieldID}
                        shouldShowRightIcon
                        viewMode={CONST.OPTION_MODE.COMPACT}
                        title={field.name}
                        description={field.value}
                        onPress={() => setSelectedField(field)}
                    />
                ))}
            </ScrollView>
            <Button
                large
                text={translate('common.reset')}
                style={[styles.mh4, styles.mt4]}
                onPress={resetValues}
            />
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                onSubmit={() => {}}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

SearchFiltersReportFieldPage.displayName = 'SearchFiltersReportFieldPage';

export default SearchFiltersReportFieldPage;
