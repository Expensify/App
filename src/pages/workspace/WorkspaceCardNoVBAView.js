import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {Apple, Bank} from '../../components/Icon/Expensicons';
import Icon from '../../components/Icon';
import UnorderedList from '../../components/UnorderedList';
import MenuItemList from '../../components/MenuItemList';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = ({translate, policyID}) => (
    <>
        <View style={styles.pageWrapper}>

            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flexShrink1]}>
                    <Text style={[styles.textXLarge]}>{translate('workspace.card.header')}</Text>
                </View>
                <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}>
                    {/* TODO: Replace this with the proper icon */}
                    <Icon src={Apple} height={50} width={50} />
                </View>
            </View>

            <View style={[styles.w100]}>
                <View style={[styles.mv4]}>
                    <Text>{translate('workspace.card.noVBACopy')}</Text>
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
                    title: translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID)),
                    icon: Bank,
                    shouldShowRightIcon: true,
                },
            ]}
        />
    </>
);

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
