import React, {useState} from 'react';
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

function SearchFiltersReportFieldPage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
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

    if (selectedField) {
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
                <ScrollView contentContainerStyle={[styles.flexGrow1]}></ScrollView>
                <Button
                    text={translate('common.reset')}
                    onPress={() => {}}
                    style={[styles.mh4, styles.mt4]}
                    large
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
                {Object.values(fieldList ?? {}).map((value) => (
                    <MenuItem
                        key={value.fieldID}
                        shouldShowRightIcon
                        viewMode={CONST.OPTION_MODE.COMPACT}
                        title={value.name}
                        description={undefined}
                        onPress={() => setSelectedField(value)}
                    />
                ))}
            </ScrollView>
            <Button
                text={translate('common.reset')}
                onPress={() => {}}
                style={[styles.mh4, styles.mt4]}
                large
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
