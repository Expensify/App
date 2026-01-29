import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setImportTransactionSettings} from '@libs/actions/ImportSpreadsheet';
import Navigation from '@libs/Navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function ImportTransactionsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const cardDisplayName = importedSpreadsheet?.importTransactionSettings?.cardDisplayName ?? '';
    const currency = importedSpreadsheet?.importTransactionSettings?.currency ?? 'USD';
    const [isReimbursable, setIsReimbursable] = useState(importedSpreadsheet?.importTransactionSettings?.isReimbursable ?? true);
    const [flipAmountSign, setFlipAmountSign] = useState(importedSpreadsheet?.importTransactionSettings?.flipAmountSign ?? false);

    const navigateToCardNameSelection = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_CARD_NAME);
    }, []);

    const navigateToCurrencySelection = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_CURRENCY);
    }, []);

    const handleNext = useCallback(() => {
        // Store import settings in Onyx so they're available when importing
        setImportTransactionSettings(cardDisplayName, currency, isReimbursable, flipAmountSign);
        // No cardID = creating a new card
        Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_SPREADSHEET.getRoute());
    }, [cardDisplayName, currency, isReimbursable, flipAmountSign]);

    return (
        <ScreenWrapper
            testID="ImportTransactionsPage"
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.importTransactions.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.textNormal, styles.mh5, styles.mb5]}>{translate('workspace.companyCards.importTransactions.description')}</Text>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={cardDisplayName || undefined}
                        description={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                        style={styles.moneyRequestMenuItem}
                        titleStyle={styles.flex1}
                        onPress={navigateToCardNameSelection}
                    />
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={currency}
                        description={translate('workspace.companyCards.importTransactions.currency')}
                        style={styles.moneyRequestMenuItem}
                        titleStyle={styles.flex1}
                        onPress={navigateToCurrencySelection}
                    />
                    <View style={[styles.mv3, styles.mh5]}>
                        <ToggleSettingOptionRow
                            title={translate('workspace.companyCards.importTransactions.transactionsAreReimbursable')}
                            switchAccessibilityLabel={translate('workspace.companyCards.importTransactions.transactionsAreReimbursable')}
                            onToggle={setIsReimbursable}
                            isActive={isReimbursable}
                        />
                    </View>
                    <View style={[styles.mv3, styles.mh5]}>
                        <ToggleSettingOptionRow
                            title={translate('workspace.companyCards.importTransactions.flipAmountSign')}
                            switchAccessibilityLabel={translate('workspace.companyCards.importTransactions.flipAmountSign')}
                            onToggle={setFlipAmountSign}
                            isActive={flipAmountSign}
                        />
                    </View>
                </View>
                <View style={[styles.mh5, styles.mb5]}>
                    <Button
                        success
                        large
                        text={translate('common.next')}
                        onPress={handleNext}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ImportTransactionsPage.displayName = 'ImportTransactionsPage';

export default ImportTransactionsPage;
