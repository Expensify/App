import React, {useMemo, useState} from 'react';
import {Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import * as ReportUtils from '@libs/ReportUtils';
import * as TripsResevationUtils from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type EmptySearchViewProps = {
    type: SearchDataTypes;
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

function EmptySearchView({type}: EmptySearchViewProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
                {ctaErrorMessage && (
                    <DotIndicatorMessage
                        style={styles.mt1}
                        messages={{error: ctaErrorMessage}}
                        type="error"
                    />
                )}
            </>
        );
    }, [styles, translate, ctaErrorMessage]);

    const [onboardingPurpose] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: (introSelected) => introSelected?.choice});
    const navatticLink = onboardingPurpose === CONST.SELECTABLE_ONBOARDING_CHOICES.MANAGE_TEAM ? CONST.NAVATTIC.ADMIN_TOUR : CONST.NAVATTIC.EMPLOYEE_TOUR;

    const content = useMemo(() => {
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return {
                    headerMedia: LottieAnimations.TripsEmptyState,
                    headerStyles: StyleUtils.getBackgroundColorStyle(theme.travelBG),
                    headerContentStyles: StyleUtils.getWidthAndHeightStyle(375, 240),
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
                };
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
                return {
                    headerMedia: LottieAnimations.GenericEmptyState,
                    headerStyles: [StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                    title: translate('search.searchResults.emptyExpenseResults.title'),
                    subtitle: translate('search.searchResults.emptyExpenseResults.subtitle'),
                    buttons: [
                        {buttonText: translate('emptySearchView.takeATour'), buttonAction: () => Link.openExternalLink(navatticLink)},
                        {
                            buttonText: translate('iou.createExpense'),
                            buttonAction: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.TYPE.CREATE, ReportUtils.generateReportID())),
                            success: true,
                        },
                    ],
                    headerContentStyles: styles.emptyStateFolderWebStyles,
                };
            case CONST.SEARCH.DATA_TYPES.CHAT:
            case CONST.SEARCH.DATA_TYPES.INVOICE:
            default:
                return {
                    headerMedia: LottieAnimations.GenericEmptyState,
                    headerStyles: [StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    headerContentStyles: styles.emptyStateFolderWebStyles,
                };
        }
    }, [type, StyleUtils, translate, theme, styles, subtitleComponent, ctaErrorMessage, navatticLink]);

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
            headerMedia={content.headerMedia}
            headerStyles={[content.headerStyles, styles.emptyStateCardIllustrationContainer]}
            title={content.title}
            titleStyles={content.titleStyles}
            subtitle={content.subtitle}
            buttons={content.buttons}
            headerContentStyles={[styles.h100, styles.w100, content.headerContentStyles]}
            lottieWebViewStyles={styles.emptyStateFolderWebStyles}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
