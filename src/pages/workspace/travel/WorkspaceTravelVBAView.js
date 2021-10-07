import React from 'react';
import {View, Text, Linking} from 'react-native';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    Bank,
    ExpensifyCard,
    NewWindow,
    Info,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import compose from '../../../libs/compose';
import {openSignedInLink} from '../../../libs/actions/App';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = ({translate}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.travel.packYourBags')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.common.issueAndManageCards'),
                    onPress: () => openSignedInLink('domain_companycards'),
                    icon: ExpensifyCard,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
                {
                    title: translate('workspace.travel.bookTravelWithConcierge'),
                    onPress: () => console.log('TODO: link to the concierge chat'),
                    icon: Bank, // TODO: use the concierge bell icon
                    shouldShowRightIcon: true,
                },
                {
                    title: translate('requestorStep.learnMore'),
                    onPress: () => Linking.openURL('https://community.expensify.com/discussion/7066/introducing-concierge-travel'),
                    icon: Info,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.travel.VBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default compose(
    withLocalize,
)(WorkspaceTravelVBAView);
