import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getRoom} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {accountGuideDetailsSelector} from '@selectors/Account';
import React from 'react';
import {View} from 'react-native';

import GettingStartedRow from './GettingStartedRow';
import useGettingStartedItems from './hooks/useGettingStartedItems';

function GettingStartedSection() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [guideDetails] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountGuideDetailsSelector});
    const hasGuide = !!guideDetails?.email;
    const {shouldShowSection, items} = useGettingStartedItems();

    const openAdminsRoom = () => {
        const policyAdminsReportID = activePolicy?.chatReportIDAdmins?.toString();
        const adminsRoomReportIDFromPolicy = policyAdminsReportID && policyAdminsReportID !== CONST.DEFAULT_NUMBER_ID.toString() ? policyAdminsReportID : undefined;
        const adminsRoomReportID = (activePolicyID ? getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, activePolicyID)?.reportID : undefined) ?? adminsRoomReportIDFromPolicy;
        if (!adminsRoomReportID) {
            return;
        }

        if (shouldUseNarrowLayout) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsRoomReportID, undefined, undefined, ROUTES.HOME));
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: adminsRoomReportID, backTo: ROUTES.HOME}));
    };

    const helpLinkText = translate(hasGuide ? 'homePage.gettingStartedSection.talkToAccountExecutive' : 'homePage.gettingStartedSection.talkToConcierge');
    const footerHelpText = `${translate('homePage.gettingStartedSection.needHelp')} ${helpLinkText} ${translate('homePage.gettingStartedSection.forGuidedSetup')}`;

    if (!shouldShowSection) {
        return null;
    }

    return (
        <WidgetContainer title={translate('homePage.gettingStartedSection.title')}>
            <View style={[styles.getForYouSectionContainerStyle(shouldUseNarrowLayout), styles.mb2]}>
                {items.map((item) => (
                    <GettingStartedRow
                        key={item.key}
                        item={item}
                    />
                ))}
            </View>
            <View style={shouldUseNarrowLayout ? [styles.ph5, styles.pb5] : [styles.ph8, styles.pb8]}>
                <PressableWithoutFeedback
                    onPress={openAdminsRoom}
                    accessibilityLabel={footerHelpText}
                    role={CONST.ROLE.LINK}
                    sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_FOOTER_HELP}
                >
                    <Text style={[styles.textLabelSupporting, styles.gettingStartedFooterLink]}>
                        {`${translate('homePage.gettingStartedSection.needHelp')} `}
                        <Text style={styles.link}>{helpLinkText}</Text>
                        {` ${translate('homePage.gettingStartedSection.forGuidedSetup')}`}
                    </Text>
                </PressableWithoutFeedback>
            </View>
        </WidgetContainer>
    );
}

export default GettingStartedSection;
