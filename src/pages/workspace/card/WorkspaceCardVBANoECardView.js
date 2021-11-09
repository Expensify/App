import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {Mail} from '../../../components/Icon/Expensicons';
import {JewelBoxBlue} from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import {openOldDotLink} from '../../../libs/actions/Link';
import {subscribeToExpensifyCardUpdates} from '../../../libs/actions/User';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBANoECardView = ({user, translate}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.card.header')}
            icon={JewelBoxBlue}
            menuItems={[
                {
                    title: translate('workspace.card.addWorkEmail'),
                    onPress: () => {
                        Navigation.dismissModal();
                        openOldDotLink('settings?param={"section":"account","openModal":"secondaryLogin"}');
                        subscribeToExpensifyCardUpdates();
                    },
                    icon: Mail,
                    shouldShowRightIcon: true,
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
        {user.isCheckingDomain && <Text style={[styles.m5, styles.formError]}>
            {translate('workspace.card.checkingDomain')}
        </Text>}
    </>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        }
    })
)(WorkspaceCardVBANoECardView);