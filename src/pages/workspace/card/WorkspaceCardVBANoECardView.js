import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {Concierge} from '../../../components/Icon/Expensicons';
import {JewelBoxBlue} from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';
import {navigateToConciergeChat} from '../../../libs/actions/Report';
import Navigation from '../../../libs/Navigation/Navigation';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBANoECardView = props => (
    <WorkspaceSection
        title={props.translate('workspace.card.header')}
        icon={JewelBoxBlue}
        menuItems={[
            {
                title: props.translate('workspace.card.chatWithConcierge'),
                onPress: () => {
                    Navigation.dismissModal();
                    navigateToConciergeChat();
                },
                icon: Concierge,
                shouldShowRightIcon: true,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>{props.translate('workspace.card.VBANoECardCopy')}</Text>
        </View>

        <UnorderedList
            items={[
                props.translate('workspace.card.benefit1'),
                props.translate('workspace.card.benefit2'),
                props.translate('workspace.card.benefit3'),
                props.translate('workspace.card.benefit4'),
            ]}
        />

        <View style={[styles.mv4]}>
            <Text>{props.translate('workspace.card.conciergeCanHelp')}</Text>
        </View>
    </WorkspaceSection>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default withLocalize(WorkspaceCardVBANoECardView);
