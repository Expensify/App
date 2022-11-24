import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import * as Link from '../../../libs/actions/Link';
import Section from '../../../components/Section';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBAWithECardView = (props) => {
    const menuItems = [
        {
            title: props.translate('workspace.common.issueAndManageCards'),
            onPress: () => Link.openOldDotLink('domain_companycards'),
            icon: Expensicons.ExpensifyCard,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            iconFill: themeColors.success,
            wrapperStyle: [styles.cardMenuItem],
        },
        {
            title: props.translate('workspace.common.reconcileCards'),
            onPress: () => Link.openOldDotLink(encodeURI('domain_companycards?param={"section":"cardReconciliation"}')),
            icon: Expensicons.ReceiptSearch,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            iconFill: themeColors.success,
            wrapperStyle: [styles.cardMenuItem],
        },
        {
            title: props.translate('workspace.common.settlementFrequency'),
            onPress: () => Link.openOldDotLink(encodeURI('domain_companycards?param={"section":"configureSettings"}')),
            icon: Expensicons.Gear,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            iconFill: themeColors.success,
            wrapperStyle: [styles.cardMenuItem],
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
};

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
