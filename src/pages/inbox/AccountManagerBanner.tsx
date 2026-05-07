import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import Banner from '@components/Banner';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isConciergeChatReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
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
    const [accountManagerData] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (account) => ({
            accountManagerReportID: account?.accountManagerReportID,
            accountManagerAccountID: account?.accountManagerAccountID,
        }),
    });
    const accountManagerReportID = accountManagerData?.accountManagerReportID;
    const accountManagerAccountID = Number(accountManagerData?.accountManagerAccountID ?? CONST.DEFAULT_MISSING_ID);
    const [participantPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(accountManagerAccountID),
    });
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    if (!accountManagerReportID || !isConciergeChatReport(report) || !isBannerVisible) {
        return null;
    }
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
