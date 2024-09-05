import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session, User} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceBillsFirstSectionOnyxProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<Session>;

    /** Information about the logged in user's account */
    user: OnyxEntry<User>;
};

type WorkspaceBillsFirstSectionProps = WorkspaceBillsFirstSectionOnyxProps & {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceBillsFirstSection({session, policyID, user}: WorkspaceBillsFirstSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const emailDomain = Str.extractEmailDomain(session?.email ?? '');
    const manageYourBillsUrl = `reports?policyID=${policyID}&from=all&type=bill&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`;

    return (
        <Section
            title={translate('workspace.bills.manageYourBills')}
            icon={Illustrations.PinkBill}
            isCentralPane
            menuItems={[
                {
                    title: translate('workspace.bills.viewAllBills'),
                    onPress: () => Link.openOldDotLink(manageYourBillsUrl),
                    icon: Expensicons.Bill,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(manageYourBillsUrl),
                },
            ]}
            containerStyles={styles.cardSectionContainer}
        >
            <View style={styles.mv3}>
                <Text>
                    {translate('workspace.bills.askYourVendorsBeforeEmail')}
                    {user?.isFromPublicDomain ? (
                        <TextLink onPress={() => Link.openExternalLink('https://community.expensify.com/discussion/7500/how-to-pay-your-company-bills-in-expensify/')}>
                            example.com@expensify.cash
                        </TextLink>
                    ) : (
                        <CopyTextToClipboard
                            text={`${emailDomain}@expensify.cash`}
                            textStyles={styles.textBlue}
                        />
                    )}
                    <Text>{translate('workspace.bills.askYourVendorsAfterEmail')}</Text>
                </Text>
            </View>
        </Section>
    );
}

WorkspaceBillsFirstSection.displayName = 'WorkspaceBillsFirstSection';

export default function WorkspaceBillsFirstSectionOnyx(props: Omit<WorkspaceBillsFirstSectionProps, keyof WorkspaceBillsFirstSectionOnyxProps>) {
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);
    const [user, userMetadata] = useOnyx(ONYXKEYS.USER);

    if (isLoadingOnyxValue(sessionMetadata, userMetadata)) {
        return null;
    }

    return (
        <WorkspaceBillsFirstSection
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            session={session}
            user={user}
        />
    );
}
