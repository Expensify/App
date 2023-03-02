import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import * as Link from '../../../libs/actions/Link';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsVBAView = props => (
    <>
        <WorkspaceBillsFirstSection policyID={props.policyID} />

        <Section
            title={props.translate('workspace.bills.hassleFreeBills')}
            icon={Illustrations.MoneyBadge}
            menuItems={[
                {
                    title: props.translate('workspace.common.bills'),
                    onPress: () => Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=bill&showStates=Processing,Approved&isAdvancedFilterMode=true`),
                    icon: Expensicons.Bill,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                },
            ]}
        >
            <View style={[styles.mv3]}>
                <Text>{props.translate('workspace.bills.VBACopy')}</Text>
            </View>
        </Section>
    </>
);

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
