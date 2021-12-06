import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import * as Link from '../../../libs/actions/Link';
import * as User from '../../../libs/actions/User';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBANoECardView = props => (
    <>
        <WorkspaceSection
            title={props.translate('workspace.card.header')}
            icon={Illustrations.JewelBoxBlue}
            menuItems={[
                {
                    title: props.translate('workspace.card.addWorkEmail'),
                    onPress: () => {
                        Navigation.dismissModal();
                        Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                        User.subscribeToExpensifyCardUpdates();
                    },
                    icon: Expensicons.Mail,
                    shouldShowRightIcon: true,
                },
            ]}
        >
            <UnorderedList
                items={[
                    props.translate('workspace.card.benefit1'),
                    props.translate('workspace.card.benefit2'),
                    props.translate('workspace.card.benefit3'),
                    props.translate('workspace.card.benefit4'),
                ]}
            />
        </WorkspaceSection>
        {props.user.isCheckingDomain && (
            <ExpensifyText style={[styles.m5, styles.formError]}>
                {props.translate('workspace.card.checkingDomain')}
            </ExpensifyText>
        )}
    </>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardVBANoECardView);
