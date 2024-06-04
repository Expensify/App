import type {StackScreenProps} from '@react-navigation/stack';
import Str from 'expensify-common/lib/str';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import AutoUpdateTime from '@components/AutoUpdateTime';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CommunicationsLink from '@components/CommunicationsLink';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import type {DetailsNavigatorParamList} from '@navigation/types';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList, Session} from '@src/types/onyx';

type DetailsPageOnyxProps = {
    /** The personal details of the person who is logged in */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type DetailsPageProps = DetailsPageOnyxProps & StackScreenProps<DetailsNavigatorParamList, typeof SCREENS.DETAILS_ROOT>;

/**
 * Gets the phone number to display for SMS logins
 */
const getPhoneNumber = ({login = '', displayName = ''}: PersonalDetails): string | undefined => {
    // If the user hasn't set a displayName, it is set to their phone number, so use that
    const parsedPhoneNumber = parsePhoneNumber(displayName);
    if (parsedPhoneNumber.possible) {
        return parsedPhoneNumber?.number?.e164;
    }

    // If the user has set a displayName, get the phone number from the SMS login
    return login ? Str.removeSMSDomain(login) : '';
};

function DetailsPage({personalDetails, route, session}: DetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const login = route.params?.login ?? '';
    const sessionAccountID = session?.accountID ?? 0;

    let details = Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login === login.toLowerCase());

    if (!details) {
        const optimisticAccountID = UserUtils.generateAccountID(login);
        details = {
            accountID: optimisticAccountID,
            login,
            displayName: login,
        };
    }

    const isSMSLogin = details.login ? Str.isSMSLogin(details.login) : false;

    const shouldShowLocalTime = !ReportUtils.hasAutomatedExpensifyAccountIDs([details.accountID]) && details.timezone;
    let pronouns = details.pronouns;

    if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
        const localeKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
        pronouns = translate(`pronouns.${localeKey}` as TranslationPaths);
    }

    const phoneNumber = getPhoneNumber(details);
    const phoneOrEmail = isSMSLogin ? getPhoneNumber(details) : details.login;
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(details, '', false);

    const isCurrentUser = sessionAccountID === details.accountID;

    return (
        <ScreenWrapper testID={DetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!login || CONST.RESTRICTED_EMAILS.includes(login)}>
                <HeaderWithBackButton title={translate('common.details')} />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {details ? (
                        <ScrollView>
                            <View style={styles.avatarSectionWrapper}>
                                <AttachmentModal
                                    headerTitle={displayName}
                                    source={UserUtils.getFullSizeAvatar(details?.avatar, details.accountID)}
                                    originalFileName={details.originalFileName}
                                    maybeIcon
                                >
                                    {({show}) => (
                                        <PressableWithoutFocus
                                            style={styles.noOutline}
                                            onPress={show}
                                            accessibilityLabel={translate('common.details')}
                                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                        >
                                            <OfflineWithFeedback pendingAction={details?.pendingFields?.avatar}>
                                                <Avatar
                                                    containerStyles={[styles.avatarLarge, styles.mb3]}
                                                    imageStyles={[styles.avatarLarge]}
                                                    source={details?.avatar}
                                                    avatarID={details?.accountID}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                    fallbackIcon={details?.fallbackIcon}
                                                />
                                            </OfflineWithFeedback>
                                        </PressableWithoutFocus>
                                    )}
                                </AttachmentModal>
                                {Boolean(displayName) && (
                                    <Text
                                        style={[styles.textHeadline, styles.mb6, styles.pre]}
                                        numberOfLines={1}
                                    >
                                        {displayName}
                                    </Text>
                                )}
                                {details.login ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer, styles.w100]}>
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mb1]}
                                            numberOfLines={1}
                                        >
                                            {translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                        </Text>
                                        <CommunicationsLink value={phoneOrEmail ?? ''}>
                                            <UserDetailsTooltip accountID={details.accountID}>
                                                <Text numberOfLines={1}>{isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : details.login}</Text>
                                            </UserDetailsTooltip>
                                        </CommunicationsLink>
                                    </View>
                                ) : null}
                                {pronouns ? (
                                    <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mb1]}
                                            numberOfLines={1}
                                        >
                                            {translate('profilePage.preferredPronouns')}
                                        </Text>
                                        <Text numberOfLines={1}>{pronouns}</Text>
                                    </View>
                                ) : null}
                                {shouldShowLocalTime && <AutoUpdateTime timezone={details?.timezone ?? {}} />}
                            </View>
                            {!isCurrentUser && (
                                <MenuItem
                                    title={`${translate('common.message')}${displayName}`}
                                    titleStyle={styles.flex1}
                                    icon={Expensicons.ChatBubble}
                                    onPress={() => Report.navigateToAndOpenReport([login])}
                                    wrapperStyle={styles.breakAll}
                                    shouldShowRightIcon
                                />
                            )}
                        </ScrollView>
                    ) : null}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DetailsPage.displayName = 'DetailsPage';

export default withOnyx<DetailsPageProps, DetailsPageOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(DetailsPage);
