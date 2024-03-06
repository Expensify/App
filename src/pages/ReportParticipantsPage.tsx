import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsList from '@components/OptionsList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import type * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportParticipantsPageOnyxProps = {
    /** Personal details of all the users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportParticipantsPageProps = ReportParticipantsPageOnyxProps & WithReportOrNotFoundProps;

/**
 * Returns all the participants in the active report
 *
 * @param report The active report object
 * @param personalDetails The personal details of the users
 * @param translate The localize
 */
const getAllParticipants = (
    report: OnyxEntry<Report>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: Localize.PhraseParameters<Localize.Phrase<TKey>>) => string,
): OptionData[] =>
    ReportUtils.getVisibleMemberIDs(report)
        .map((accountID, index) => {
            const userPersonalDetail = personalDetails?.[accountID];
            const userLogin =
                !!userPersonalDetail?.login && !CONST.RESTRICTED_ACCOUNT_IDS.includes(accountID) ? LocalePhoneNumber.formatPhoneNumber(userPersonalDetail.login) : translate('common.hidden');
            const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(userPersonalDetail);

            return {
                alternateText: userLogin,
                displayName,
                accountID: userPersonalDetail?.accountID ?? accountID,
                icons: [
                    {
                        id: accountID,
                        source: UserUtils.getAvatar(userPersonalDetail?.avatar ?? '', accountID),
                        name: userLogin,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: `${index}-${userLogin}`,
                login: userLogin,
                text: displayName,
                tooltipText: userLogin,
                participantsList: [{accountID, displayName}],
                reportID: report?.reportID ?? '',
            };
        })
        .sort((a, b) => localeCompare(a.displayName, b.displayName));

function ReportParticipantsPage({report, personalDetails}: ReportParticipantsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const participants = getAllParticipants(report, personalDetails, translate).map((participant) => ({
        ...participant,
        isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? 0) || CONST.RESTRICTED_ACCOUNT_IDS.includes(participant.accountID ?? 0),
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ReportParticipantsPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!report || ReportUtils.isArchivedRoom(report) || ReportUtils.isSelfDM(report)}>
                    <HeaderWithBackButton
                        onBackButtonPress={report ? () => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID)) : undefined}
                        title={translate(
                            ReportUtils.isChatRoom(report) ||
                                ReportUtils.isPolicyExpenseChat(report) ||
                                ReportUtils.isChatThread(report) ||
                                ReportUtils.isTaskReport(report) ||
                                ReportUtils.isMoneyRequestReport(report)
                                ? 'common.members'
                                : 'common.details',
                        )}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                        {participants?.length && (
                            <OptionsList
                                sections={[
                                    {
                                        title: '',
                                        data: participants,
                                        shouldShow: true,
                                        indexOffset: 0,
                                    },
                                ]}
                                onSelectRow={(option: OptionData) => {
                                    if (!option.accountID) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID, report ? ROUTES.REPORT_PARTICIPANTS.getRoute(report.reportID) : undefined));
                                }}
                                hideSectionHeaders
                                showTitleTooltip
                                showScrollIndicator
                                disableFocusOptions
                                boldStyle
                                optionHoveredStyle={styles.hoveredComponentBG}
                                contentContainerStyles={[safeAreaPaddingBottomStyle]}
                            />
                        )}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default withReportOrNotFound()(
    withOnyx<ReportParticipantsPageProps, ReportParticipantsPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(ReportParticipantsPage),
);
