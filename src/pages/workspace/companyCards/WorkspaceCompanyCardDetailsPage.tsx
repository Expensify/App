import type {StackScreenProps} from '@react-navigation/stack';
import {format} from 'date-fns';
import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_DETAILS>;

function WorkspaceCompanyCardDetailsPage({route}: WorkspaceCompanyCardDetailsPageProps) {
    const {policyID, cardID, backTo, bank} = route.params;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const policy = usePolicy(policyID);
    const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allBankCards, allBankCardsMetadata] = useOnyx(`${ONYXKEYS.CARD_LIST}`);
    const card = allBankCards?.[cardID];

    const cardBank = card?.bank ?? '';
    const cardholder = personalDetails?.[card?.accountID ?? -1];
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);

    // useEffect(() => {
    //     Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
    //         connections: {
    //             quickbooksOnline: {
    //                 config: {
    //                     companyName: 'test',
    //                     credentials: {
    //                         access_token:
    //                             '2LHOKnH9waofJaMRyrVBUP+4qJsh4u+6E3Ffu73YJFJ6FnzAfsydZVkVFwjQmyxknEXCOYNeqoRljafcUk2sgzeq6002fXY55AEKF36UjaQQskfo4wR192K0v/68BUEzCpghfahoRmupoNq0u1JM8h/NDNIcLEi9ZDBno+7a22wi2jshJtcGL/wGBMUalWFupOmkiJbLPFen+mHFqLI8kF4TydI2a7SC4M4BAkZ2N7cFvp9LC39cLvrL7pZ/0wdIe8d4AMrKdR8M8V+KD8r2X4zXoQhKxSPA+2wRFiXIwOKB2iZqgI19dQHD0QqwbW6a512nOb7Q1Y0/SrF6NtVAaBXwhF2o3VULwFH3cy4QTYxB25wXCU76bhYsvUaQ/xWUVjY2TEi3GXkdTrNN8Ys8MXH3A9kVX7I32whBMfygcjYLtxc4/aVr8gYg8w5XPRRJ5Q/OGy68mX1JlCyWi+1NNAUJVkeRXuOsnivYvvaRisCJ4bng4ZiK9hnSWJ6qyKMWnb/nPpjZfZe25nbXfEG/e3CgwJ3KU4RlWZM+ECSWGcM/KyAGfErbcDBXXQk/6BnMjTqQkP5HotH8BHsUzYsw8D1A8i3gpgU/CStK8b+2PFcoqgTxWmsPgL7O32AFNR6z1yd1Zsrk5cDVHDlTddw1ePxrvfJRuT7gNKlut9oIAjgyR5iagxk/By2AGp0o2S53becAoPRGtuYYxk5WmpfB2q0N0QHI9VtRDJ5p1wn4KPO4twnnkU5YyD/u2UuBCWw9UB1rDWZVpGRUilyF2/0vy7PJHoUCXodz0DIulT+cDSHqf9hmc1pm7LI3Qt17X4uO1YCIQA7qQk1G5aY32HwNVq2VnyZJT64nEJ3JMydI4k74jrGy9Zp+52lAF39AenCaNjbVJg5svd0KEeOdwqr1j9SNkrHZkMmhuAUSI/WfyAhrtmjmRVGBTJ6b9l8fjdzwLwubXdFInG8M7h8Pc0Db7VTvd8Qv8MFRjhomzHbTkVMApKr1EH9WGzf932FlDse9HwKC4c6mA2Uj0BCaxsbnKnqd/I6Ug==;vJoXwrJgPzNOdv28yQHtPA==;eKPhE8t3aDV62W1np/MZoKIYA1bRawdFuttb5yxT44HQWjYgEc5x/Glx+Ye6YZP06Aj3N0A7eMw6rj98Kjpaow==',
    //                         companyID: '934145206296',
    //                         companyName: 'test',
    //                         expires: 1730725016,
    //                         realmId: '934145340296',
    //                         refresh_token:
    //                             'KwizVqdImwI5kHeImQ2NrXO7rteCSzvtQakR3uhp7Y04X06z3F4Hvt42jw==;fK/XjysVFPC4lYgRXbzi/RpxI1z3aWWpaLSAnT5v1kRtg4ilXX9fjQvA6Wc3LhKqZXnADugm2DbveEmZWAItlg==',
    //                         scope: 'Accounting',
    //                         token_type: 'bearer',
    //                     },
    //                     realmId: '9341453405206',
    //                     autoSync: {
    //                         enabled: true,
    //                         jobID: '4604867689969023701',
    //                     },
    //                     syncClasses: 'REPORT_FIELD',
    //                     pendingFields: {},
    //                     errorFields: {},
    //                     syncLocations: 'NONE',
    //                     autoCreateVendor: false,
    //                     collectionAccountID: '29',
    //                     enableNewCategories: true,
    //                     export: {
    //                         exporter: 'zhenja3033@gmail.com',
    //                     },
    //                     exportDate: 'REPORT_EXPORTED',
    //                     hasChosenAutoSyncOption: true,
    //                     lastConfigurationTime: 1730721696740,
    //                     markChecksToBePrinted: false,
    //                     nonReimbursableBillDefaultVendor: 'NONE',
    //                     nonReimbursableExpensesAccount: {
    //                         currency: 'PLN',
    //                         glCode: '',
    //                         id: '29',
    //                         name: 'Cash and cash equivalents',
    //                     },
    //                     nonReimbursableExpensesExportDestination: 'debit_card',
    //                     reimbursableExpensesAccount: {
    //                         currency: 'PLN',
    //                         glCode: '',
    //                         id: '29',
    //                         name: 'Cash and cash equivalents',
    //                     },
    //                     reimbursableExpensesExportDestination: 'bill',
    //                     reimbursementAccountID: '29',
    //                     syncCustomers: 'TAG',
    //                     syncItems: false,
    //                     syncPeople: false,
    //                     syncTax: false,
    //                 },
    //                 data: {
    //                     accountPayable: [],
    //                     accountsReceivable: [],
    //                     bankAccounts: [
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '29',
    //                             name: 'Cash and cash equivalents',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '30',
    //                             name: 'Test 1234',
    //                         },
    //                     ],
    //                     country: 'PL',
    //                     creditCards: [],
    //                     edition: 'QuickBooks Online Simple Start',
    //                     employees: [],
    //                     homeCurrency: 'PLN',
    //                     isMultiCurrencyEnabled: false,
    //                     journalEntryAccounts: [
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '32',
    //                             name: 'Accrued liabilities',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '70',
    //                             name: 'Allowance for bad debt',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '13',
    //                             name: 'Available for sale assets (short-term)',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '38',
    //                             name: 'Dividends payable',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '26',
    //                             name: 'Income tax payable',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '65',
    //                             name: 'Inventory',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '74',
    //                             name: 'Payroll Clearing',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '73',
    //                             name: 'Payroll liabilities',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '47',
    //                             name: 'Prepaid expenses',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '71',
    //                             name: 'Short-term debit',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '1',
    //                             name: 'Uncategorised Asset',
    //                         },
    //                     ],
    //                     otherCurrentAssetAccounts: [
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '70',
    //                             name: 'Allowance for bad debt',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '13',
    //                             name: 'Available for sale assets (short-term)',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '65',
    //                             name: 'Inventory',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '47',
    //                             name: 'Prepaid expenses',
    //                         },
    //                         {
    //                             currency: 'PLN',
    //                             glCode: '',
    //                             id: '1',
    //                             name: 'Uncategorised Asset',
    //                         },
    //                     ],
    //                     vendors: [],
    //                 },
    //                 lastSync: {
    //                     errorDate: '',
    //                     errorMessage: '',
    //                     isAuthenticationError: false,
    //                     isConnected: true,
    //                     isSuccessful: true,
    //                     source: 'NEWEXPENSIFY',
    //                     successfulDate: '2024-11-04T12:01:36+0000',
    //                 },
    //             },
    //         },
    //     });
    // }, [policyID]);

    const unassignCard = () => {
        setIsUnassignModalVisible(false);
        CompanyCards.unassignWorkspaceCompanyCard(workspaceAccountID, cardID, bank);
        Navigation.goBack();
    };

    const updateCard = () => {
        CompanyCards.updateWorkspaceCompanyCard(workspaceAccountID, cardID, bank);
    };

    if (!card && !isLoadingOnyxValue(allBankCardsMetadata)) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceCompanyCardDetailsPage.displayName}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithBackButton
                            title={translate('workspace.moreFeatures.companyCards.cardDetails')}
                            onBackButtonPress={() => Navigation.goBack(backTo)}
                        />
                        <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                            <View style={[styles.walletCard, styles.mb3]}>
                                <ImageSVG
                                    contentFit="contain"
                                    src={CardUtils.getCardFeedIcon(cardBank as CompanyCardFeed)}
                                    pointerEvents="none"
                                    height={variables.cardPreviewHeight}
                                    width={variables.cardPreviewWidth}
                                />
                            </View>

                            <MenuItem
                                label={translate('workspace.moreFeatures.companyCards.cardholder')}
                                title={displayName}
                                icon={cardholder?.avatar ?? FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                description={cardholder?.login}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.cardNumber')}
                                title={CardUtils.maskCard(card?.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                            <OfflineWithFeedback
                                pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}
                                errorRowStyles={[styles.ph5, styles.mb3]}
                                errors={ErrorUtils.getLatestErrorField(card?.nameValuePairs ?? {}, 'cardTitle')}
                                onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'cardTitle')}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('workspace.moreFeatures.companyCards.cardName')}
                                    title={customCardNames?.[cardID] ?? ''}
                                    shouldShowRightIcon
                                    brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_NAME.getRoute(policyID, cardID, bank))}
                                />
                            </OfflineWithFeedback>
                            {exportMenuItem?.shouldShowMenuItem ? (
                                <OfflineWithFeedback
                                    pendingAction={card?.nameValuePairs?.pendingFields?.exportAccountDetails}
                                    errorRowStyles={[styles.ph5, styles.mb3]}
                                    errors={ErrorUtils.getLatestErrorField(card?.nameValuePairs ?? {}, 'exportAccountDetails')}
                                    onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'exportAccountDetails')}
                                >
                                    <MenuItemWithTopDescription
                                        description={exportMenuItem.description}
                                        title={exportMenuItem.title}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID, bank))}
                                    />
                                </OfflineWithFeedback>
                            ) : null}
                            <MenuItemWithTopDescription
                                shouldShowRightComponent={card?.isLoadingLastUpdated}
                                rightComponent={
                                    <ActivityIndicator
                                        style={[styles.popoverMenuIcon]}
                                        color={theme.spinner}
                                    />
                                }
                                description={translate('workspace.moreFeatures.companyCards.lastUpdated')}
                                title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : card?.lastScrape}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                                title={card?.scrapeMinDate ? format(card.scrapeMinDate, CONST.DATE.FNS_FORMAT_STRING) : ''}
                                interactive={false}
                            />
                            <OfflineWithFeedback
                                pendingAction={card?.pendingFields?.lastScrape}
                                errorRowStyles={[styles.ph5, styles.mb3]}
                                errors={ErrorUtils.getLatestErrorField(card ?? {}, 'lastScrape')}
                                onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'lastScrape', true)}
                            >
                                <MenuItem
                                    icon={Expensicons.Sync}
                                    iconFill={theme.success}
                                    title={translate('workspace.moreFeatures.companyCards.updateCard')}
                                    style={styles.mv1}
                                    brickRoadIndicator={card?.errorFields?.lastScrape ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={updateCard}
                                />
                            </OfflineWithFeedback>
                            <MenuItem
                                icon={Expensicons.RemoveMembers}
                                iconFill={theme.success}
                                title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                                style={styles.mv1}
                                onPress={() => setIsUnassignModalVisible(true)}
                            />
                            <ConfirmModal
                                title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                                isVisible={isUnassignModalVisible}
                                onConfirm={unassignCard}
                                onCancel={() => setIsUnassignModalVisible(false)}
                                shouldSetModalVisibility={false}
                                prompt={translate('workspace.moreFeatures.companyCards.unassignCardDescription')}
                                confirmText={translate('workspace.moreFeatures.companyCards.unassign')}
                                cancelText={translate('common.cancel')}
                                danger
                            />
                        </ScrollView>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardDetailsPage.displayName = 'WorkspaceCompanyCardDetailsPage';

export default WorkspaceCompanyCardDetailsPage;
