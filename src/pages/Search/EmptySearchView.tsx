import React, {useMemo, useState} from 'react';
import {Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {hasSeenTourSelector} from '@libs/onboardingSelectors';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {getNavatticURL} from '@libs/TourUtils';
import * as TripsResevationUtils from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import * as Task from '@userActions/Task';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type EmptySearchViewProps = {
    type: SearchDataTypes;
    hasResults: boolean;
};

const tripsFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Illustrations.Alert,
        translationKey: 'travel.features.alerts',
    },
];

function EmptySearchView({type, hasResults}: EmptySearchViewProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return PolicyUtils.areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);

    const [ctaErrorMessage, setCtaErrorMessage] = useState('');

    const subtitleComponent = useMemo(() => {
        return (
            <>
                <Text style={[styles.textSupporting, styles.textNormal]}>
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
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pt4, styles.pl1]}>
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
                {!!ctaErrorMessage && (
                    <DotIndicatorMessage
                        style={styles.mt1}
                        messages={{error: ctaErrorMessage}}
                        type="error"
                    />
                )}
            </>
        );
    }, [styles, translate, ctaErrorMessage]);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const onboardingPurpose = introSelected?.choice;
    const {environment} = useEnvironment();
    const navatticURL = getNavatticURL(environment, onboardingPurpose);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });
    const viewTourTaskReportID = introSelected?.viewTour;
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReportID}`);

    const content = useMemo(() => {
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return {
                    headerMedia: LottieAnimations.TripsEmptyState,
                    headerContentStyles: [StyleUtils.getWidthAndHeightStyle(375, 240), StyleUtils.getBackgroundColorStyle(theme.travelBG)],
                    title: translate('travel.title'),
                    titleStyles: {...styles.textAlignLeft},
                    subtitle: subtitleComponent,
                    buttons: [
                        {
                            buttonText: translate('search.searchResults.emptyTripResults.buttonText'),
                            buttonAction: () => TripsResevationUtils.bookATrip(translate, setCtaErrorMessage, ctaErrorMessage),
                            success: true,
                        },
                    ],
                    lottieWebViewStyles: {backgroundColor: theme.travelBG, ...styles.emptyStateFolderWebStyles},
                };
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
                if (!hasResults) {
                    return {
                        headerMedia: LottieAnimations.GenericEmptyState,
                        title: translate('search.searchResults.emptyExpenseResults.title'),
                        subtitle: translate('search.searchResults.emptyExpenseResults.subtitle'),
                        buttons: [
                            ...(!hasSeenTour
                                ? [
                                      {
                                          buttonText: translate('emptySearchView.takeATour'),
                                          buttonAction: () => {
                                              Link.openExternalLink(navatticURL);
                                              Welcome.setSelfTourViewed();
                                              Task.completeTask(viewTourTaskReport);
                                          },
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
                                        IOU.startMoneyRequest(CONST.IOU.TYPE.CREATE, ReportUtils.generateReportID());
                                    }),
                                success: true,
                            },
                        ],
                        headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                        lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
                    };
                }
            // We want to display the default nothing to show message if there is any filter applied.
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.INVOICE:
                if (!hasResults) {
                    return {
                        headerMedia: LottieAnimations.GenericEmptyState,
                        title: translate('search.searchResults.emptyInvoiceResults.title'),
                        subtitle: translate('search.searchResults.emptyInvoiceResults.subtitle'),
                        buttons: [
                            ...(!hasSeenTour
                                ? [
                                      {
                                          buttonText: translate('emptySearchView.takeATour'),
                                          buttonAction: () => {
                                              Link.openExternalLink(navatticURL);
                                              Welcome.setSelfTourViewed();
                                              Task.completeTask(viewTourTaskReport);
                                          },
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
                                        IOU.startMoneyRequest(CONST.IOU.TYPE.INVOICE, ReportUtils.generateReportID());
                                    }),
                                success: true,
                            },
                        ],
                        headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                        lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
                    };
                }
            // eslint-disable-next-line no-fallthrough
            case CONST.SEARCH.DATA_TYPES.CHAT:
            default:
                return {
                    headerMedia: LottieAnimations.GenericEmptyState,
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                    lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
                };
        }
    }, [
        type,
        StyleUtils,
        theme.travelBG,
        theme.emptyFolderBG,
        translate,
        styles.textAlignLeft,
        styles.emptyStateFolderWebStyles,
        subtitleComponent,
        hasSeenTour,
        ctaErrorMessage,
        navatticURL,
        shouldRedirectToExpensifyClassic,
        hasResults,
        viewTourTaskReport,
    ]);

    return (
        <>
            <EmptyStateComponent
                SkeletonComponent={SearchRowSkeleton}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                headerMedia={content.headerMedia}
                headerStyles={[styles.emptyStateCardIllustrationContainer, styles.overflowHidden]}
                title={content.title}
                titleStyles={content.titleStyles}
                subtitle={content.subtitle}
                buttons={content.buttons}
                headerContentStyles={[styles.h100, styles.w100, ...content.headerContentStyles]}
                lottieWebViewStyles={content.lottieWebViewStyles}
            />
            <ConfirmModal
                prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')}
                isVisible={modalVisible}
                onConfirm={() => {
                    setModalVisible(false);
                    Link.openOldDotLink(CONST.OLDDOT_URLS.INBOX);
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
