import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Bill,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import {MoneyMousePink} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import {openOldDotLink} from '../../../libs/actions/Link';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsVBAView = props => (
    <>
        <WorkspaceBillsFirstSection policyID={props.policyID} />

        <WorkspaceSection
            title={props.translate('workspace.bills.hassleFreeBills')}
            icon={MoneyMousePink}
            menuItems={[
                {
                    title: props.translate('workspace.common.bills'),
                    onPress: () => openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=bill&showStates=Processing,Approved&isAdvancedFilterMode=true`),
                    icon: Bill,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.bills.VBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
