import React from 'react';
import {View} from 'react-native';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import Button from './Button';
import ExpensifyWordmark from './ExpensifyWordmark';
import Text from './Text';

type AnonymousReportFooterProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;
};

function AnonymousReportFooter({reportID}: AnonymousReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isSmallSizeLayout = windowWidth - (shouldUseNarrowLayout ? 0 : variables.sideBarWithLHBWidth) < variables.anonymousReportFooterBreakpoint || isInSidePanel;

    return (
        <View style={[styles.anonymousRoomFooter, styles.anonymousRoomFooterFlexDirection(isSmallSizeLayout)]}>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName
                    report={report}
                    isAnonymous
                    shouldEnableDetailPageNavigation
                />
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.anonymousRoomFooterWordmarkAndLogoContainer(isSmallSizeLayout)]}>
                <View style={[isSmallSizeLayout ? styles.mr1 : styles.mr4, styles.flexShrink1]}>
                    <View style={[isSmallSizeLayout ? styles.alignItemsStart : styles.alignItemsEnd]}>
                        <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
                    </View>
                    <Text style={styles.anonymousRoomFooterLogoTaglineText}>{translate('anonymousReportFooter.logoTagline')}</Text>
                </View>
                <View style={[styles.anonymousRoomFooterSignInButton]}>
                    <Button
                        success
                        text={translate('common.signIn')}
                        onPress={() => {
                            signOutAndRedirectToSignIn();
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

export default AnonymousReportFooter;
