import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {Apple, Bank, NewWindow, ExpensifyCard} from '../../components/Icon/Expensicons';
import UnorderedList from '../../components/UnorderedList';
import MenuItemList from '../../components/MenuItemList';
import {openSignedInLink} from '../../libs/actions/App';
import Icon from '../../components/Icon';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBAWithECardView = ({translate}) => (
    <>
        <View style={styles.pageWrapper}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flexShrink1]}>
                    <Text style={[styles.textXLarge]}>{translate('workspace.card.headerWithEcard')}</Text>
                </View>
                <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}>
                    {/* TODO: Replace this with the proper icon */}
                    <Icon src={Apple} height={50} width={50} />
                </View>
            </View>

            <View style={[styles.w100]}>
                <View style={[styles.mv4]}>
                    <Text>{translate('workspace.card.VBAWithECardCopy')}</Text>
                </View>

                <UnorderedList
                    items={[
                        translate('workspace.card.benefit1'),
                        translate('workspace.card.benefit2'),
                        translate('workspace.card.benefit3'),
                        translate('workspace.card.benefit4'),
                    ]}
                />
            </View>
        </View>

        <MenuItemList
            menuItems={[
                {
                    title: translate('workspace.common.issueAndManageCards'),
                    onPress: () => openSignedInLink('domain_companycards'),
                    icon: ExpensifyCard,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
                {
                    title: translate('workspace.common.reconcileCards'),
                    onPress: () => openSignedInLink('settings?param={"section":"account","openModal":"secondaryLogin"})'),
                    /* TODO: Need to use the reconcile icon once it's added to the repo */
                    icon: Bank,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        />
    </>
);

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
