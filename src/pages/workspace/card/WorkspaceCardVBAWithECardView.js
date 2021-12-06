import React from 'react';
import {View} from 'react-native';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import * as Link from '../../../libs/actions/Link';
import WorkspaceSection from '../WorkspaceSection';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBAWithECardView = props => (
    <WorkspaceSection
        title={props.translate('workspace.card.headerWithEcard')}
        icon={Illustrations.CreditCardsBlue}
        menuItems={[
            {
                title: props.translate('workspace.common.issueAndManageCards'),
                onPress: () => Link.openOldDotLink('domain_companycards'),
                icon: Expensicons.ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
            {
                title: props.translate('workspace.common.reconcileCards'),
                onPress: () => Link.openOldDotLink(encodeURI('domain_companycards?param={"section":"cardReconciliation"}')),
                icon: Expensicons.ReceiptSearch,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <ExpensifyText>{props.translate('workspace.card.VBAWithECardCopy')}</ExpensifyText>
        </View>

        <UnorderedList
            items={[
                props.translate('workspace.card.benefit1'),
                props.translate('workspace.card.benefit2'),
                props.translate('workspace.card.benefit3'),
                props.translate('workspace.card.benefit4'),
            ]}
        />
    </WorkspaceSection>
);

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
