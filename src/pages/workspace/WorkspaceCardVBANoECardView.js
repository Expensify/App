import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {Apple, Bank, NewWindow} from '../../components/Icon/Expensicons';
import UnorderedList from '../../components/UnorderedList';
import {openSignedInLink} from '../../libs/actions/App';
import WorkspaceSection from './WorkspaceSection';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBANoECardView = ({translate}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.card.header')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.common.addWorkEmailAddress'),
                    onPress: () => openSignedInLink('settings?param={"section":"account","openModal":"secondaryLogin"})'),

                    /* TODO: Need to use the briefcase icon once it's added to the repo */
                    icon: Bank,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.card.VBANoECardCopy')}</Text>
            </View>

            <UnorderedList
                items={[
                    translate('workspace.card.benefit1'),
                    translate('workspace.card.benefit2'),
                    translate('workspace.card.benefit3'),
                    translate('workspace.card.benefit4'),
                ]}
            />
        </WorkspaceSection>
    </>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default withLocalize(WorkspaceCardVBANoECardView);
