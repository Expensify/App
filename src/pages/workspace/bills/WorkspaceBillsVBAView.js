import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
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

        <WorkspaceSection
            title={props.translate('workspace.bills.hassleFreeBills')}
            icon={Illustrations.MoneyMousePink}
            menuItems={[
                {
                    title: props.translate('workspace.common.bills'),
                    onPress: () => Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=bill&showStates=Processing,Approved&isAdvancedFilterMode=true`),
                    icon: Expensicons.Bill,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <ExpensifyText>{props.translate('workspace.bills.VBACopy')}</ExpensifyText>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
