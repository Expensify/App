import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemWithLink} from '@components/MenuItemList';
import Section from '@components/Section';
import Text from '@components/Text';
import UnorderedList from '@components/UnorderedList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';

type MenuLinks = {
    ISSUE_AND_MANAGE_CARDS: string;
    RECONCILE_CARDS: string;
    SETTLEMENT_FREQUENCY: string;
};

type MenuItems = MenuItemWithLink[];

const MENU_LINKS: MenuLinks = {
    ISSUE_AND_MANAGE_CARDS: 'domain_companycards',
    RECONCILE_CARDS: encodeURI('domain_companycards?param={"section":"cardReconciliation"}'),
    SETTLEMENT_FREQUENCY: encodeURI('domain_companycards?param={"section":"configureSettings"}'),
};

function WorkspaceCardVBAWithECardView() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const menuItems: MenuItems = [
        {
            title: translate('workspace.common.issueAndManageCards'),
            onPress: () => Link.openOldDotLink(MENU_LINKS.ISSUE_AND_MANAGE_CARDS),
            icon: Expensicons.ExpensifyCard,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: () => Link.buildOldDotURL(MENU_LINKS.ISSUE_AND_MANAGE_CARDS),
        },
        {
            title: translate('workspace.common.reconcileCards'),
            onPress: () => Link.openOldDotLink(MENU_LINKS.RECONCILE_CARDS),
            icon: Expensicons.ReceiptSearch,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: () => Link.buildOldDotURL(MENU_LINKS.RECONCILE_CARDS),
        },
        {
            title: translate('workspace.common.settlementFrequency'),
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
            title={translate('workspace.card.headerWithEcard')}
            icon={Illustrations.CreditCardsNew}
            menuItems={menuItems}
        >
            <View style={[styles.mv3]}>
                <Text>{translate('workspace.card.VBAWithECardCopy')}</Text>
            </View>

            <View style={[styles.mv3]}>
                <UnorderedList
                    items={[translate('workspace.card.benefit1'), translate('workspace.card.benefit2'), translate('workspace.card.benefit3'), translate('workspace.card.benefit4')]}
                />
            </View>
        </Section>
    );
}

WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default WorkspaceCardVBAWithECardView;
