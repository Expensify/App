import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/Session';
import React, {useState} from 'react';
import type {ReactNode} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ImageStyle, Text as RNText, TextStyle, ViewStyle} from 'react-native';
import {Linking, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import BookTravelButton from '@components/BookTravelButton';
import ConfirmModal from '@components/ConfirmModal';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {EmptyStateButton, HeaderMedia, MediaTypes} from '@components/EmptyStateComponent/types';
import type {FeatureListItem} from '@components/FeatureList';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ScrollView from '@components/ScrollView';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {createNewReport} from '@libs/actions/Report';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {areAllGroupPoliciesExpenseChatDisabled, getDefaultChatEnabledPolicy, getGroupPaidPoliciesWithExpenseChatEnabled} from '@libs/PolicyUtils';
import {generateReportID, hasEmptyReportsForPolicy, hasViolations as hasViolationsReportUtils, reportSummariesOnyxSelector} from '@libs/ReportUtils';
import {isDefaultExpenseReportsQuery, isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, PersonalDetails, Policy, Report, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import getEmptyArray from '@src/types/utils/getEmptyArray';
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
    headerMediaType: MediaTypes;
    headerMedia: HeaderMedia;
    title: string;
    subtitle?: string;
    headerContentStyles: Array<Pick<ViewStyle, 'width' | 'height'>>;
    lottieWebViewStyles?: React.CSSProperties | undefined;
    buttons?: EmptyStateButton[];
    headerStyles?: ViewStyle;
    titleStyles?: TextStyle;
    subtitleStyle?: TextStyle;
    children?: React.ReactNode;
};

type ReportSummary = ReturnType<typeof reportSummariesOnyxSelector>[number];

function EmptySearchView({similarSearchHash, type, hasResults, queryJSON}: EmptySearchViewProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {typeMenuSections, CreateReportConfirmationModal: SearchMenuCreateReportConfirmationModal} = useSearchTypeMenuSections();

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});

    const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
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
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const illustrations = useMemoizedLazyIllustrations(['PiggyBank', 'TravelAlerts']);

    const tripsFeatures: FeatureListItem[] = [
        {
            icon: illustrations.PiggyBank,
            translationKey: 'travel.features.saveMoney',
        },
        {
            icon: illustrations.TravelAlerts,
            translationKey: 'travel.features.alerts',
        },
    ];
    const [contextMenuAnchor, setContextMenuAnchor] = useState<RNText | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, accountID ?? CONST.DEFAULT_NUMBER_ID, '');

    const [hasTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
        selector: hasTransactionsSelector,
    });
    const [hasExpenseReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: hasExpenseReportsSelector,
    });

    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});

    const shouldRedirectToExpensifyClassic = areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {});

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<Policy>>, activePolicy);

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const [reportSummaries = getEmptyArray<ReportSummary>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: reportSummariesOnyxSelector,
    });
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});
    const shouldShowEmptyReportConfirmation = hasEmptyReportsForPolicy(reportSummaries, defaultChatEnabledPolicyID, accountID) && hasDismissedEmptyReportsConfirmation !== true;

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

    const typeMenuItems = typeMenuSections.map((section) => section.menuItems).flat();

    const onLongPress = (event: GestureResponderEvent | MouseEvent) => {
        if (!contextMenuAnchor) {
            return;
        }

        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.LINK,
            event,
            selection: CONST.BOOK_TRAVEL_DEMO_URL,
            contextMenuAnchor,
        });
    };

    const tripViewChildren = (
        <>
            <Text style={[styles.textSupporting, styles.textNormal]}>
                {translate('travel.subtitle')}{' '}
                <PressableWithSecondaryInteraction
                    inline
                    onSecondaryInteraction={onLongPress}
                    accessible
                    accessibilityLabel={translate('travel.bookADemo')}
                >
                    <TextLink
                        onLongPress={onLongPress}
                        onPress={() => {
                            Linking.openURL(CONST.BOOK_TRAVEL_DEMO_URL);
                        }}
                        ref={setContextMenuAnchor}
                    >
                        {translate('travel.bookADemo')}
                    </TextLink>
                </PressableWithSecondaryInteraction>
                {translate('travel.toLearnMore')}
            </Text>
            <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pt4, styles.pl1, styles.mb5]}>
                {tripsFeatures.map((tripsFeature) => (
                    <View
                        key={tripsFeature.translationKey}
                        style={styles.w100}
                    >
                        <MenuItem
                            title={translate(tripsFeature.translationKey)}
                            icon={tripsFeature.icon}
                            iconWidth={variables.menuIconSize}
                            iconHeight={variables.menuIconSize}
                            interactive={false}
                            displayInDefaultIconColor
                            wrapperStyle={[styles.p0, styles.cursorAuto]}
                            containerStyle={[styles.m0, styles.wAuto]}
                            numberOfLinesTitle={0}
                        />
                    </View>
                ))}
            </View>
            {!!activePolicy?.isTravelEnabled && (
                <SearchScopeProvider isOnSearch={false}>
                    <BookTravelButton
                        text={translate('search.searchResults.emptyTripResults.buttonText')}
                        activePolicyID={activePolicy?.id}
                    />
                </SearchScopeProvider>
            )}
        </>
    );

    // Default 'Folder' lottie animation, along with its background styles
    const defaultViewItemHeader = useSearchEmptyStateIllustration();

    const startTestDriveAction = () => {
        startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember);
    };

    let content: EmptySearchViewItem | undefined;

    // Begin by going through all of our To-do searches, and returning their empty state
    // if it exists
    for (const menuItem of typeMenuItems) {
        if (menuItem.similarSearchHash === similarSearchHash && menuItem.emptyState) {
            content = {
                ...defaultViewItemHeader.fireworks,
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
                    headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
                    headerMedia: LottieAnimations.TripsEmptyState,
                    headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.travelBG)],
                    title: translate('travel.title'),
                    titleStyles: {...styles.textAlignLeft},
                    children: tripViewChildren,
                    lottieWebViewStyles: {backgroundColor: theme.travelBG, ...styles.emptyStateFolderWebStyles, ...styles.tripEmptyStateLottieWebView},
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
                                    buttonAction: () =>
                                        interceptAnonymousUser(() => {
                                            if (shouldRedirectToExpensifyClassic) {
                                                setModalVisible(true);
                                                return;
                                            }
                                            startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID());
                                        }),
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
                                buttonAction: () =>
                                    interceptAnonymousUser(() => {
                                        if (shouldRedirectToExpensifyClassic) {
                                            setModalVisible(true);
                                            return;
                                        }
                                        startMoneyRequest(CONST.IOU.TYPE.INVOICE, generateReportID());
                                    }),
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
                    SkeletonComponent={SearchRowSkeleton}
                    headerMediaType={content.headerMediaType}
                    headerMedia={content.headerMedia}
                    headerStyles={[styles.emptyStateCardIllustrationContainer, styles.overflowHidden, content.headerStyles]}
                    title={content.title}
                    titleStyles={content.titleStyles}
                    subtitle={content.subtitle}
                    buttons={content.buttons}
                    headerContentStyles={[styles.h100, styles.w100, ...content.headerContentStyles] as Array<ViewStyle & ImageStyle>}
                    lottieWebViewStyles={content.lottieWebViewStyles}
                >
                    {content.children}
                </GenericEmptyStateComponent>
            </ScrollView>
            {CreateReportConfirmationModal}
            <ConfirmModal
                prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')}
                isVisible={modalVisible}
                onConfirm={() => {
                    setModalVisible(false);
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
                onCancel={() => setModalVisible(false)}
                title={translate('sidebarScreen.redirectToExpensifyClassicModal.title')}
                confirmText={translate('exitSurvey.goToExpensifyClassic')}
                cancelText={translate('common.cancel')}
            />
        </>
    );
}

export type {EmptySearchViewItem};
export default EmptySearchView;
