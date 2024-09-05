import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import Button from './Button';
import ExpensifyWordmark from './ExpensifyWordmark';
import Text from './Text';

type AnonymousReportFooterPropsWithOnyx = {
    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<Policy>;
};

type AnonymousReportFooterProps = AnonymousReportFooterPropsWithOnyx & {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** Whether the small screen size layout should be used */
    isSmallSizeLayout?: boolean;
};

function AnonymousReportFooter({isSmallSizeLayout = false, report, policy}: AnonymousReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.anonymousRoomFooter(isSmallSizeLayout)}>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName
                    report={report}
                    isAnonymous
                    shouldEnableDetailPageNavigation
                    policy={policy}
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

export default function ComponentWithOnyx(props: Omit<AnonymousReportFooterProps, keyof AnonymousReportFooterPropsWithOnyx>) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.report?.policyID}`);

    if (isLoadingOnyxValue(policyMetadata)) {
        return null;
    }

    return (
        <AnonymousReportFooter
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            policy={policy}
        />
    );
}
