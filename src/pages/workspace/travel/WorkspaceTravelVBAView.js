import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import * as Link from '../../../libs/actions/Link';
import * as Report from '../../../libs/actions/Report';
import CONST from '../../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = (props) => (
    <Section
        title={props.translate('workspace.travel.packYourBags')}
        icon={Illustrations.Luggage}
        menuItems={[
            {
                title: props.translate('workspace.common.issueAndManageCards'),
                onPress: () => Link.openOldDotLink('domain_companycards'),
                icon: Expensicons.ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                wrapperStyle: [styles.cardMenuItem],
                link: () => Link.buildOldDotURL('domain_companycards'),
            },
            {
                title: props.translate('workspace.travel.bookTravelWithConcierge'),
                onPress: () => {
                    Report.navigateToConciergeChat();
                },
                icon: Expensicons.Concierge,
                shouldShowRightIcon: true,
                wrapperStyle: [styles.cardMenuItem],
            },
            {
                title: props.translate('requestorStep.learnMore'),
                onPress: () => Link.openExternalLink(CONST.CONCIERGE_TRAVEL_URL),
                icon: Expensicons.Info,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                wrapperStyle: [styles.cardMenuItem],
                link: CONST.CONCIERGE_TRAVEL_URL,
            },
        ]}
    >
        <View style={[styles.mv3]}>
            <Text>{props.translate('workspace.travel.VBACopy')}</Text>
        </View>
    </Section>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default withLocalize(WorkspaceTravelVBAView);
