import {useState} from 'react';
import Banner from '@components/Banner';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getParticipantsAccountIDsForDisplay, isConciergeChatReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type AccountManagerBannerProps = {
    reportID: string | undefined;
};

function AccountManagerBanner({reportID}: AccountManagerBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID);
    const [accountManagerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(accountManagerReportID)}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    if (!accountManagerReportID || !isConciergeChatReport(report) || !isBannerVisible) {
        return null;
    }

    const participants = getParticipantsAccountIDsForDisplay(accountManagerReport, false, true);
    const participantPersonalDetails = getPersonalDetailsForAccountIDs([participants?.at(0) ?? -1], personalDetails);
    const participantPersonalDetail = Object.values(participantPersonalDetails).at(0);
    const displayName = getDisplayNameOrDefault(participantPersonalDetail);
    const login = participantPersonalDetail?.login;
    const chatWithAccountManagerText = displayName && login ? translate('common.chatWithAccountManager', `${displayName} (${login})`) : '';

    const dismissBanner = () => setIsBannerVisible(false);
    const chatWithAccountManager = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID));
    };

    return (
        <Banner
            containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.br2, styles.breakWord]}
            text={chatWithAccountManagerText}
            onClose={dismissBanner}
            onButtonPress={chatWithAccountManager}
            shouldShowCloseButton
            icon={expensifyIcons.Lightbulb}
            shouldShowIcon
            shouldShowButton
        />
    );
}

AccountManagerBanner.displayName = 'AccountManagerBanner';

export default AccountManagerBanner;
