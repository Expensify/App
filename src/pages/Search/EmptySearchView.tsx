import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';
import type {ReactNode} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Linking, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import BookTravelButton from '@components/BookTravelButton';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {EmptyStateButton, HeaderMedia} from '@components/EmptyStateComponent/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScrollView from '@components/ScrollView';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useConfirmModal from '@hooks/useConfirmModal';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {createNewReport} from '@libs/actions/Report';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {areAllGroupPoliciesExpenseChatDisabled, getDefaultChatEnabledPolicy, getGroupPaidPoliciesWithExpenseChatEnabled} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {isDefaultExpenseReportsQuery, isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, PersonalDetails, Policy, Report, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import useSearchEmptyStateIllustration from './useSearchEmptyStateIllustration';

type EmptySearchViewProps = {
    similarSearchHash: number;
    type: SearchDataTypes;
    hasResults: boolean;
    queryJSON?: SearchQueryJSON;
};

type EmptySearchViewContentProps = EmptySearchViewProps & {
    currentUserPersonalDetails: PersonalDetails;
    typeMenuSections: SearchTypeMenuSection[];
    allPolicies: OnyxCollection<Policy>;
    isUserPaidPolicyMember: boolean;
    activePolicy: OnyxEntry<Policy>;
    groupPoliciesWithChatEnabled: readonly never[] | Array<OnyxEntry<Policy>>;
    introSelected: OnyxEntry<IntroSelected>;
    hasSeenTour: boolean;
    searchMenuCreateReportConfirmationModal: ReactNode;
};

type EmptySearchViewItem = {
    headerMedia: HeaderMedia;
    title: string;
    subtitle?: string;
    subtitleText?: React.ReactNode;
    headerContentStyles: Array<Pick<ViewStyle, 'width' | 'height'>>;
    buttons?: EmptyStateButton[];
    titleStyles?: TextStyle;
    subtitleStyle?: TextStyle;
    children?: React.ReactNode;
};

function EmptySearchView({similarSearchHash, type, hasResults, queryJSON}: EmptySearchViewProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {typeMenuSections, CreateReportConfirmationModal: SearchMenuCreateReportConfirmationModal} = useSearchTypeMenuSections();

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);

    const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });

    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();

    return (
        <SearchScopeProvider>
            <EmptySearchViewContent
                similarSearchHash={similarSearchHash}
                type={type}
                hasResults={hasResults}
                currentUserPersonalDetails={currentUserPersonalDetails}
                typeMenuSections={typeMenuSections}
                allPolicies={allPolicies}
                isUserPaidPolicyMember={isUserPaidPolicyMember}
                activePolicy={activePolicy}
                groupPoliciesWithChatEnabled={groupPoliciesWithChatEnabled}
                introSelected={introSelected}
                hasSeenTour={hasSeenTour}
                searchMenuCreateReportConfirmationModal={SearchMenuCreateReportConfirmationModal}
                queryJSON={queryJSON}
            />
        </SearchScopeProvider>
    );
}

const hasTransactionsSelector = (transactions: OnyxCollection<Transaction>) =>
    Object.values(transactions ?? {}).filter((transaction) => transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 0;

const hasExpenseReportsSelector = (reports: OnyxCollection<Report>) =>
    Object.values(reports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && report?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 0;

function EmptySearchViewContent({
    similarSearchHash,
    type,
    hasResults,
    currentUserPersonalDetails,
    typeMenuSections,
    allPolicies,
    isUserPaidPolicyMember,
    activePolicy,
    groupPoliciesWithChatEnabled,
    introSelected,
    hasSeenTour,
    searchMenuCreateReportConfirmationModal,
    queryJSON,
}: EmptySearchViewContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const illustrations = useMemoizedLazyIllustrations(['EmptyStateTravel'] as const);
    const {showConfirmModal} = useConfirmModal();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, accountID ?? CONST.DEFAULT_NUMBER_ID, '');

    const [hasTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: hasTransactionsSelector,
    });
    const [hasExpenseReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: hasExpenseReportsSelector,
    });

    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector});

    const shouldRedirectToExpensifyClassic = areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {});

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<Policy>>, activePolicy);

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const shouldShowEmptyReportConfirmation = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const filteredPolicyID = queryJSON?.policyID;
    let isFilteredWorkspaceAccessible = true;
    if (filteredPolicyID) {
        const policyIDToCheck = Array.isArray(filteredPolicyID) ? filteredPolicyID.at(0) : filteredPolicyID;
        const filteredPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToCheck}`];
        isFilteredWorkspaceAccessible = !!filteredPolicy;
    }

    const handleCreateWorkspaceReport = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!defaultChatEnabledPolicy?.id) {
            return;
        }

        const {reportID: createdReportID} = createNewReport(
            currentUserPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            defaultChatEnabledPolicy,
            betas,
            false,
            shouldDismissEmptyReportsConfirmation,
        );
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
        });
    };

    const {openCreateReportConfirmation: openCreateReportFromSearch, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    const handleCreateReportClick = () => {
        if (shouldShowEmptyReportConfirmation) {
            openCreateReportFromSearch();
        } else {
            handleCreateWorkspaceReport(false);
        }
    };

    const handleRedirectToExpensifyClassic = () => {
        showConfirmModal({
            prompt: translate('sidebarScreen.redirectToExpensifyClassicModal.description'),
            title: translate('sidebarScreen.redirectToExpensifyClassicModal.title'),
            confirmText: translate('exitSurvey.goToExpensifyClassic'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
        });
    };

    const handleCreateMoneyRequest = (iouType: typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.INVOICE) => {
        interceptAnonymousUser(() => {
            if (shouldRedirectToExpensifyClassic) {
                handleRedirectToExpensifyClassic();
                return;
            }
            startMoneyRequest(iouType, generateReportID());
        });
    };

    const typeMenuItems = typeMenuSections.map((section) => section.menuItems).flat();
    const todoMenuItems = new Set(typeMenuSections.filter((section) => section.translationPath === 'common.todo').flatMap((section) => section.menuItems));

    // Default 'Folder' illustration styles
    const defaultViewItemHeader = useSearchEmptyStateIllustration();

    const startTestDriveAction = () => {
        startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember);
    };

    let content: EmptySearchViewItem | undefined;

    // Begin by going through all of our searches, and returning their empty state
    // if it exists. Use fireworks for celebratory items (To-do, Unapproved Cash), folder for everything else.
    for (const menuItem of typeMenuItems) {
        if (menuItem.similarSearchHash === similarSearchHash && menuItem.emptyState) {
            const useFireworks = todoMenuItems.has(menuItem) || menuItem.key === CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH;
            content = {
                ...(useFireworks ? defaultViewItemHeader.fireworks : defaultViewItemHeader.folder),
                title: translate(menuItem.emptyState.title),
                subtitle: translate(menuItem.emptyState.subtitle),
                buttons: menuItem.emptyState.buttons?.map((button) => ({
                    ...button,
                    buttonText: translate(button.buttonText),
                })),
            };
            break;
        }
    }

    // If we didn't match a specific search hash, show a specific message based on the type of the data
    if (!content) {
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                content = {
                    headerMedia: illustrations.EmptyStateTravel,
                    headerContentStyles: [styles.tripEmptyStateIllustration],
                    title: translate('travel.title'),
                    subtitleText: (
                        <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                            {translate('travel.subtitle')}{' '}
                            <TextLink
                                onPress={() => {
                                    Linking.openURL(CONST.BOOK_TRAVEL_DEMO_URL);
                                }}
                            >
                                {translate('travel.bookADemo')}
                            </TextLink>
                            {translate('travel.toLearnMore')}
                        </Text>
                    ),
                    children: activePolicy?.isTravelEnabled ? (
                        <View style={[styles.mt6, styles.alignSelfCenter]}>
                            <SearchScopeProvider isOnSearch={false}>
                                <BookTravelButton
                                    text={translate('search.searchResults.emptyTripResults.buttonText')}
                                    activePolicyID={activePolicy?.id}
                                />
                            </SearchScopeProvider>
                        </View>
                    ) : undefined,
                };
                break;
            case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
                if (!isFilteredWorkspaceAccessible) {
                    content = {
                        ...defaultViewItemHeader.folder,
                        title: translate('search.searchResults.emptyResults.title'),
                        subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    };
                } else if (hasResults && (!queryJSON || !isDefaultExpenseReportsQuery(queryJSON) || hasExpenseReports)) {
                    content = {
                        ...defaultViewItemHeader.folder,
                        title: translate('search.searchResults.emptyResults.title'),
                        subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    };
                } else if (!hasResults || !hasExpenseReports) {
                    content = {
                        ...defaultViewItemHeader.folder,
                        title: translate('search.searchResults.emptyReportResults.title'),
                        subtitle: translate(hasSeenTour ? 'search.searchResults.emptyReportResults.subtitleWithOnlyCreateButton' : 'search.searchResults.emptyReportResults.subtitle'),
                        buttons: [
                            ...(!hasSeenTour
                                ? [
                                      {
                                          buttonText: translate('emptySearchView.takeATestDrive'),
                                          buttonAction: startTestDriveAction,
                                      },
                                  ]
                                : []),
                            ...(groupPoliciesWithChatEnabled.length > 0
                                ? [
                                      {
                                          buttonText: translate('quickAction.createReport'),
                                          buttonAction: () => {
                                              interceptAnonymousUser(() => {
                                                  const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                                                  if (
                                                      !workspaceIDForReportCreation ||
                                                      (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)
                                                  ) {
                                                      // If we couldn't guess the workspace to create the report, or a guessed workspace is past it's grace period and we have other workspaces to choose from
                                                      Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                                                      return;
                                                  }

                                                  if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                                                      handleCreateReportClick();
                                                  } else {
                                                      Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                                                  }
                                              });
                                          },
                                          success: true,
                                      },
                                  ]
                                : []),
                        ],
                    };
                }
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
                if (!content) {
                    if (!isFilteredWorkspaceAccessible) {
                        content = {
                            ...defaultViewItemHeader.folder,
                            title: translate('search.searchResults.emptyResults.title'),
                            subtitle: translate('search.searchResults.emptyResults.subtitle'),
                        };
                    } else if (hasResults && (!queryJSON || !isDefaultExpensesQuery(queryJSON) || hasTransactions)) {
                        content = {
                            ...defaultViewItemHeader.folder,
                            title: translate('search.searchResults.emptyResults.title'),
                            subtitle: translate('search.searchResults.emptyResults.subtitle'),
                        };
                    } else if (!hasResults || !hasTransactions) {
                        content = {
                            ...defaultViewItemHeader.folder,
                            title: translate('search.searchResults.emptyExpenseResults.title'),
                            subtitle: translate(hasSeenTour ? 'search.searchResults.emptyExpenseResults.subtitleWithOnlyCreateButton' : 'search.searchResults.emptyExpenseResults.subtitle'),
                            buttons: [
                                ...(!hasSeenTour
                                    ? [
                                          {
                                              buttonText: translate('emptySearchView.takeATestDrive'),
                                              buttonAction: startTestDriveAction,
                                          },
                                      ]
                                    : []),
                                {
                                    buttonText: translate('iou.createExpense'),
                                    buttonAction: () => handleCreateMoneyRequest(CONST.IOU.TYPE.CREATE),
                                    success: true,
                                },
                            ],
                        };
                    }
                }
                break;
            // We want to display the default nothing to show message if there is any filter applied.
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.INVOICE:
                if (!content && !hasResults) {
                    content = {
                        title: translate('search.searchResults.emptyInvoiceResults.title'),
                        subtitle: translate(hasSeenTour ? 'search.searchResults.emptyInvoiceResults.subtitleWithOnlyCreateButton' : 'search.searchResults.emptyInvoiceResults.subtitle'),
                        buttons: [
                            ...(!hasSeenTour
                                ? [
                                      {
                                          buttonText: translate('emptySearchView.takeATestDrive'),
                                          buttonAction: startTestDriveAction,
                                      },
                                  ]
                                : []),
                            {
                                buttonText: translate('workspace.invoices.sendInvoice'),
                                buttonAction: () => handleCreateMoneyRequest(CONST.IOU.TYPE.INVOICE),
                                success: true,
                            },
                        ],
                        ...defaultViewItemHeader.folder,
                    };
                }
                break;
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.CHAT:
            default:
                if (!content) {
                    content = {
                        ...defaultViewItemHeader.folder,
                        title: translate('search.searchResults.emptyResults.title'),
                        subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    };
                }
                break;
        }
    }

    // Fallback to default content if somehow not set (should never happen in practice)
    if (!content) {
        content = {
            ...defaultViewItemHeader.folder,
            title: translate('search.searchResults.emptyResults.title'),
            subtitle: translate('search.searchResults.emptyResults.subtitle'),
        };
    }

    return (
        <>
            {searchMenuCreateReportConfirmationModal}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
            >
                <GenericEmptyStateComponent
                    headerMedia={content.headerMedia}
                    headerStyles={styles.emptyStateCardIllustrationContainer}
                    title={content.title}
                    titleStyles={content.titleStyles}
                    subtitle={content.subtitle}
                    subtitleText={content.subtitleText}
                    buttons={content.buttons}
                    headerContentStyles={[styles.h100, styles.w100, ...content.headerContentStyles] as Array<ViewStyle & ImageStyle>}
                >
                    {content.children}
                </GenericEmptyStateComponent>
            </ScrollView>
            {CreateReportConfirmationModal}
        </>
    );
}

export type {EmptySearchViewItem};
export default EmptySearchView;
