import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import UnorderedList from '@components/UnorderedList';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';

const propTypes = {
    ...withLocalizePropTypes,
};

const MENU_LINKS = {
    ISSUE_AND_MANAGE_CARDS: 'domain_companycards',
    RECONCILE_CARDS: encodeURI('domain_companycards?param={"section":"cardReconciliation"}'),
    SETTLEMENT_FREQUENCY: encodeURI('domain_companycards?param={"section":"configureSettings"}'),
};

function WorkspaceCardVBAWithECardView(props) {
    const styles = useThemeStyles();
    const menuItems = [
        {
            title: props.translate('workspace.common.issueAndManageCards'),
            onPress: () => Link.openOldDotLink(MENU_LINKS.ISSUE_AND_MANAGE_CARDS),
            icon: Expensicons.ExpensifyCard,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: () => Link.buildOldDotURL(MENU_LINKS.ISSUE_AND_MANAGE_CARDS),
        },
        {
            title: props.translate('workspace.common.reconcileCards'),
            onPress: () => Link.openOldDotLink(MENU_LINKS.RECONCILE_CARDS),
            icon: Expensicons.ReceiptSearch,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: () => Link.buildOldDotURL(MENU_LINKS.RECONCILE_CARDS),
        },
        {
            title: props.translate('workspace.common.settlementFrequency'),
            onPress: () => Link.openOldDotLink(MENU_LINKS.SETTLEMENT_FREQUENCY),
            icon: Expensicons.Gear,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: () => Link.buildOldDotURL(MENU_LINKS.SETTLEMENT_FREQUENCY),
        },
    ];

    return (
        <Section
            title={props.translate('workspace.card.headerWithEcard')}
            icon={Illustrations.CreditCardsNew}
            menuItems={menuItems}
        >
            <View style={[styles.mv3]}>
                <Text>{props.translate('workspace.card.VBAWithECardCopy')}</Text>
            </View>

            <View style={[styles.mv3]}>
                <UnorderedList
                    items={[
                        props.translate('workspace.card.benefit1'),
                        props.translate('workspace.card.benefit2'),
                        props.translate('workspace.card.benefit3'),
                        props.translate('workspace.card.benefit4'),
                    ]}
                />
            </View>
        </Section>
    );
}

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
