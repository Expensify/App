import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardsImportTransactionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_IMPORT_TRANSACTIONS>;

function WorkspaceCompanyCardsImportTransactionsPage({
    route: {
        params: {policyID, feed},
    },
}: WorkspaceCompanyCardsImportTransactionsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [cardDisplayName, setCardDisplayName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [isReimbursable, setIsReimbursable] = useState(true);
    const [flipAmountSign, setFlipAmountSign] = useState(false);

    const navigateToCardNameSelection = () => {
        // TODO: Navigate to card name selection page
    };

    const navigateToCurrencySelection = () => {
        // TODO: Navigate to currency selection page
    };

    const handleNext = () => {
        // TODO: Handle the import logic
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardsImportTransactionsPage"
                style={styles.defaultModalContainer}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('workspace.companyCards.importTransactions.title')} />
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}
                    addBottomSafeAreaPadding
                >
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
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardsImportTransactionsPage.displayName = 'WorkspaceCompanyCardsImportTransactionsPage';

export default WorkspaceCompanyCardsImportTransactionsPage;
