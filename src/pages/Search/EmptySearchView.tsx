import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ImageStyle, Text as RNText, TextStyle, ViewStyle} from 'react-native';
import {Linking, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import BookTravelButton from '@components/BookTravelButton';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {EmptyStateButton} from '@components/EmptyStateComponent/types';
import type {FeatureListItem} from '@components/FeatureList';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import MenuItem from '@components/MenuItem';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ScrollView from '@components/ScrollView';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
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

type EmptySearchViewProps = {
    similarSearchHash: number;
    type: SearchDataTypes;
    hasResults: boolean;
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
    headerMedia: DotLottieAnimation;
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

function EmptySearchView({similarSearchHash, type, hasResults}: EmptySearchViewProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {typeMenuSections, CreateReportConfirmationModal: SearchMenuCreateReportConfirmationModal} = useSearchTypeMenuSections();

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});

    const groupPoliciesWithChatEnabled = useMemo(() => getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies), [allPolicies]);

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
            />
        </SearchScopeProvider>
    );
}

const hasTransactionsSelector = (transactions: OnyxCollection<Transaction>) =>
    Object.values(transactions ?? {}).filter((transaction) => transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 0;

const hasExpenseReportsSelector = (reports: OnyxCollection<Report>) =>
    Object.values(reports ?? {}).filter((report) => report?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && report?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length >
    0;

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
}: EmptySearchViewContentProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PiggyBank', 'Alert'] as const);

    const tripsFeatures: FeatureListItem[] = useMemo(
        () => [
            {
                icon: illustrations.PiggyBank,
                translationKey: 'travel.features.saveMoney',
            },
            {
                icon: illustrations.Alert,
                translationKey: 'travel.features.alerts',
            },
        ],
        [illustrations.PiggyBank, illustrations.Alert],
    );
    const [contextMenuAnchor, setContextMenuAnchor] = useState<RNText | null>(null);
    const handleContextMenuAnchorRef = useCallback((node: RNText | null) => {
        setContextMenuAnchor(node);
    }, []);
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const [hasTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
        selector: hasTransactionsSelector,
    });
    const [hasExpenseReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: hasExpenseReportsSelector,
    });

    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});

    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {});
    }, [allPolicies]);

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: true});
    const [reportSummaries = getEmptyArray<ReportSummary>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: reportSummariesOnyxSelector,
    });
    const hasEmptyReport = useMemo(() => hasEmptyReportsForPolicy(reportSummaries, defaultChatEnabledPolicyID, accountID), [accountID, defaultChatEnabledPolicyID, reportSummaries]);

    const handleCreateWorkspaceReport = useCallback(() => {
        if (!defaultChatEnabledPolicyID) {
            return;
        }

        const {reportID: createdReportID} = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, defaultChatEnabledPolicyID);
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
        });
    }, [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicyID, isASAPSubmitBetaEnabled]);

    const {openCreateReportConfirmation: openCreateReportFromSearch, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    const handleCreateReportClick = useCallback(() => {
        if (hasEmptyReport) {
            openCreateReportFromSearch();
        } else {
            handleCreateWorkspaceReport();
        }
    }, [hasEmptyReport, handleCreateWorkspaceReport, openCreateReportFromSearch]);

    const typeMenuItems = useMemo(() => {
        return typeMenuSections.map((section) => section.menuItems).flat();
    }, [typeMenuSections]);

    const tripViewChildren = useMemo(() => {
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

        return (
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
                            ref={handleContextMenuAnchorRef}
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
                <SearchScopeProvider isOnSearch={false}>
                    <BookTravelButton text={translate('search.searchResults.emptyTripResults.buttonText')} />
                </SearchScopeProvider>
            </>
        );
    }, [contextMenuAnchor, handleContextMenuAnchorRef, styles, translate, tripsFeatures]);

    // Default 'Folder' lottie animation, along with its background styles
    const defaultViewItemHeader = useMemo(
        () => ({
            headerMedia: LottieAnimations.GenericEmptyState,
            headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
            lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
        }),
        [StyleUtils, styles.emptyStateFolderWebStyles, theme.emptyFolderBG],
    );

    const content: EmptySearchViewItem = useMemo(() => {
        // Begin by going through all of our To-do searches, and returning their empty state
        // if it exists
        for (const menuItem of typeMenuItems) {
            if (menuItem.similarSearchHash === similarSearchHash && menuItem.emptyState) {
                return {
                    headerMedia: menuItem.emptyState.headerMedia,
                    title: translate(menuItem.emptyState.title),
                    subtitle: translate(menuItem.emptyState.subtitle),
                    headerStyles: StyleUtils.getBackgroundColorStyle(theme.todoBG),
                    headerContentStyles: [StyleUtils.getWidthAndHeightStyle(375, 240), StyleUtils.getBackgroundColorStyle(theme.todoBG)],
                    lottieWebViewStyles: styles.emptyStateFireworksWebStyles,
                    buttons: menuItem.emptyState.buttons?.map((button) => ({
                        ...button,
                        buttonText: translate(button.buttonText),
                    })),
                };
            }
        }

        const startTestDriveAction = () => {
            startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember);
        };

        // If we didn't match a specific search hash, show a specific message based on the type of the data
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return {
                    headerMedia: LottieAnimations.TripsEmptyState,
                    headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.travelBG)],
                    title: translate('travel.title'),
                    titleStyles: {...styles.textAlignLeft},
                    children: tripViewChildren,
                    lottieWebViewStyles: {backgroundColor: theme.travelBG, ...styles.emptyStateFolderWebStyles, ...styles.tripEmptyStateLottieWebView},
                };
            case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
                if (hasResults) {
                    return {
                        ...defaultViewItemHeader,
                        title: translate('search.searchResults.emptyResults.title'),
                        subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    };
                }
                if (!hasResults || !hasExpenseReports) {
                    return {
                        ...defaultViewItemHeader,
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
                if (hasResults) {
                    return {
                        ...defaultViewItemHeader,
                        title: translate('search.searchResults.emptyResults.title'),
                        subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    };
                }
                if (!hasResults || !hasTransactions) {
                    return {
                        ...defaultViewItemHeader,
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
            // We want to display the default nothing to show message if there is any filter applied.
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.INVOICE:
                if (!hasResults) {
                    return {
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
                        ...defaultViewItemHeader,
                    };
                }
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.CHAT:
            default:
                return {
                    ...defaultViewItemHeader,
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                };
        }
    }, [
        type,
        typeMenuItems,
        similarSearchHash,
        translate,
        StyleUtils,
        theme.todoBG,
        theme.travelBG,
        styles.emptyStateFireworksWebStyles,
        styles.emptyStateFolderWebStyles,
        styles.textAlignLeft,
        styles.tripEmptyStateLottieWebView,
        introSelected,
        tryNewDot?.hasBeenAddedToNudgeMigration,
        isUserPaidPolicyMember,
        hasResults,
        defaultViewItemHeader,
        hasSeenTour,
        groupPoliciesWithChatEnabled.length,
        tripViewChildren,
        hasTransactions,
        shouldRedirectToExpensifyClassic,
        hasExpenseReports,
        defaultChatEnabledPolicyID,
        handleCreateReportClick,
    ]);

    return (
        <>
            {searchMenuCreateReportConfirmationModal}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
            >
                <EmptyStateComponent
                    SkeletonComponent={SearchRowSkeleton}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
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
                </EmptyStateComponent>
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

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
