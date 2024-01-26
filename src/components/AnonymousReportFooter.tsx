import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import Button from './Button';
import ExpensifyWordmark from './ExpensifyWordmark';
import Text from './Text';

type AnonymousReportFooterProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** Whether the small screen size layout should be used */
    isSmallSizeLayout?: boolean;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

function AnonymousReportFooter({isSmallSizeLayout = false, personalDetails, report}: AnonymousReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.anonymousRoomFooter(isSmallSizeLayout)}>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName
                    report={report}
                    personalDetails={personalDetails}
                    isAnonymous
                    shouldEnableDetailPageNavigation
                />
            </View>
            <View style={styles.anonymousRoomFooterWordmarkAndLogoContainer(isSmallSizeLayout)}>
                <View style={[isSmallSizeLayout ? styles.mr1 : styles.mr4, styles.flexShrink1]}>
                    <View style={[isSmallSizeLayout ? styles.alignItemsStart : styles.alignItemsEnd]}>
                        <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
                    </View>
                    <Text style={styles.anonymousRoomFooterLogoTaglineText}>{translate('anonymousReportFooter.logoTagline')}</Text>
                </View>
                <View style={[styles.anonymousRoomFooterSignInButton]}>
                    <Button
                        medium
                        success
                        text={translate('common.signIn')}
                        onPress={() => Session.signOutAndRedirectToSignIn()}
                    />
                </View>
            </View>
        </View>
    );
}

AnonymousReportFooter.displayName = 'AnonymousReportFooter';

export default AnonymousReportFooter;
