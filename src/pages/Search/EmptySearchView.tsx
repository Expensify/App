import React, {useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, ImageStyle, Text as RNText, TextStyle, ViewStyle} from 'react-native';
import {InteractionManager, Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BookTravelButton from '@components/BookTravelButton';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {EmptyStateButton} from '@components/EmptyStateComponent/types';
import type {FeatureListItem} from '@components/FeatureList';
import {Alert, PiggyBank} from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import MenuItem from '@components/MenuItem';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ScrollView from '@components/ScrollView';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {createNewReport} from '@libs/actions/Report';
import {completeTestDriveTask} from '@libs/actions/Task';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {hasSeenTourSelector} from '@libs/onboardingSelectors';
import {areAllGroupPoliciesExpenseChatDisabled, getGroupPaidPoliciesWithExpenseChatEnabled, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type EmptySearchViewProps = {
    hash: number;
    groupBy?: ValueOf<typeof CONST.SEARCH.GROUP_BY>;
    type: SearchDataTypes;
    hasResults: boolean;
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

const tripsFeatures: FeatureListItem[] = [
    {
        icon: PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Alert,
        translationKey: 'travel.features.alerts',
    },
];

function EmptySearchView({hash, type, groupBy, hasResults}: EmptySearchViewProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const contextMenuAnchor = useRef<RNText>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const hasCardFeed = useMemo(() => Object.keys(mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList)).length > 0, [userCardList, workspaceCardFeeds]);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
    });

    const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled();

    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<Policy>) ?? {});
    }, [allPolicies]);

    const typeMenuItems = useMemo(() => {
        return createTypeMenuSections(session, hasCardFeed, allPolicies)
            .map((section) => section.menuItems)
            .flat();
    }, [session, hasCardFeed, allPolicies]);

    const tripViewChildren = useMemo(() => {
        const onLongPress = (event: GestureResponderEvent | MouseEvent) => {
            showContextMenu({
                type: CONST.CONTEXT_MENU_TYPES.LINK,
                event,
                selection: CONST.BOOK_TRAVEL_DEMO_URL,
                contextMenuAnchor: contextMenuAnchor.current,
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
                            ref={contextMenuAnchor}
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
                <BookTravelButton text={translate('search.searchResults.emptyTripResults.buttonText')} />
            </>
        );
    }, [styles, translate]);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
    });
    const viewTourReportID = introSelected?.viewTour;
    const [viewTourReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourReportID}`, {canBeMissing: true});

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
            const menuHash = buildSearchQueryJSON(menuItem.getSearchQuery())?.hash;
            if (menuHash === hash && menuItem.emptyState) {
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

        const startTestDrive = () => {
            InteractionManager.runAfterInteractions(() => {
                if (
                    introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ||
                    introSelected?.choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER ||
                    introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE
                ) {
                    completeTestDriveTask(viewTourReport, viewTourReportID);
                    Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
                } else {
                    Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
                }
            });
        };

        // If we are grouping by reports, show a custom message rather than a type-specific message
        if (groupBy === CONST.SEARCH.GROUP_BY.REPORTS) {
            if (hasResults) {
                return {
                    ...defaultViewItemHeader,
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                };
            }

            return {
                ...defaultViewItemHeader,
                title: translate('search.searchResults.emptyReportResults.title'),
                subtitle: translate(hasSeenTour ? 'search.searchResults.emptyReportResults.subtitleWithOnlyCreateButton' : 'search.searchResults.emptyReportResults.subtitle'),
                buttons: [
                    ...(!hasSeenTour
                        ? [
                              {
                                  buttonText: translate('emptySearchView.takeATestDrive'),
                                  buttonAction: startTestDrive,
                              },
                          ]
                        : []),
                    ...(groupPoliciesWithChatEnabled.length > 0
                        ? [
                              {
                                  buttonText: translate('quickAction.createReport'),
                                  buttonAction: () => {
                                      interceptAnonymousUser(() => {
                                          let workspaceIDForReportCreation: string | undefined;

                                          if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
                                              // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                                              workspaceIDForReportCreation = activePolicyID;
                                          } else if (groupPoliciesWithChatEnabled.length === 1) {
                                              // If the user has only one paid group workspace with chat enabled, we create a report with it
                                              workspaceIDForReportCreation = groupPoliciesWithChatEnabled.at(0)?.id;
                                          }

                                          if (!workspaceIDForReportCreation || (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                                              // If we couldn't guess the workspace to create the report, or a guessed workspace is past it's grace period and we have other workspaces to choose from
                                              Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION);
                                              return;
                                          }

                                          if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                                              const createdReportID = createNewReport(currentUserPersonalDetails, workspaceIDForReportCreation);
                                              Navigation.setNavigationActionToMicrotaskQueue(() => {
                                                  Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                              });
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

        // If we didn't match a specific search hash, show a specific message
        // based on the type of the data
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
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
                if (!hasResults || Object.values(transactions ?? {}).length === 0) {
                    return {
                        ...defaultViewItemHeader,
                        title: translate('search.searchResults.emptyExpenseResults.title'),
                        subtitle: translate(hasSeenTour ? 'search.searchResults.emptyExpenseResults.subtitleWithOnlyCreateButton' : 'search.searchResults.emptyExpenseResults.subtitle'),
                        buttons: [
                            ...(!hasSeenTour
                                ? [
                                      {
                                          buttonText: translate('emptySearchView.takeATestDrive'),
                                          buttonAction: startTestDrive,
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
                                          buttonAction: startTestDrive,
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
        groupBy,
        type,
        typeMenuItems,
        hash,
        translate,
        StyleUtils,
        theme.todoBG,
        theme.travelBG,
        styles.emptyStateFireworksWebStyles,
        styles.emptyStateFolderWebStyles,
        styles.textAlignLeft,
        styles.tripEmptyStateLottieWebView,
        introSelected?.choice,
        hasResults,
        defaultViewItemHeader,
        hasSeenTour,
        groupPoliciesWithChatEnabled,
        activePolicy,
        activePolicyID,
        currentUserPersonalDetails,
        tripViewChildren,
        shouldRedirectToExpensifyClassic,
        viewTourReport,
        viewTourReportID,
        transactions,
    ]);

    return (
        <>
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
