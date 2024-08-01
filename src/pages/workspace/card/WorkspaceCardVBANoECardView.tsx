import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import UnorderedList from '@components/UnorderedList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {User} from '@src/types/onyx';

type WorkspaceCardVBANoECardViewOnyxProps = {
    /** Information about the logged in user's account */
    user: OnyxEntry<User>;
};

type WorkspaceCardVBANoECardViewProps = WorkspaceCardVBANoECardViewOnyxProps;

function WorkspaceCardVBANoECardView({user}: WorkspaceCardVBANoECardViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const unorderedListItems = [translate('workspace.card.benefit1'), translate('workspace.card.benefit2'), translate('workspace.card.benefit3'), translate('workspace.card.benefit4')];

    return (
        <>
            <Section
                title={translate('workspace.card.header')}
                icon={Illustrations.CreditCardsNew}
                isCentralPane
            >
                <View style={[styles.mv3]}>
                    <UnorderedList items={unorderedListItems} />
                </View>
                <Button
                    text={translate('workspace.card.addWorkEmail')}
                    onPress={() => {
                        Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                    }}
                    icon={Expensicons.Mail}
                    style={[styles.mt4]}
                    shouldShowRightIcon
                    large
                    success
                />
            </Section>
            {!!user?.isCheckingDomain && <Text style={[styles.m5, styles.formError]}>{translate('workspace.card.checkingDomain')}</Text>}
        </>
    );
}

WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default withOnyx<WorkspaceCardVBANoECardViewProps, WorkspaceCardVBANoECardViewOnyxProps>({
    user: {
        key: ONYXKEYS.USER,
    },
})(WorkspaceCardVBANoECardView);
