import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Bill,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import {MoneyMousePink} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import {openSignedInLink} from '../../../libs/actions/App';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceBillsFirstSection policyID={policyID} />

        <WorkspaceSection
            title={translate('workspace.bills.hassleFreeBills')}
            icon={MoneyMousePink}
            menuItems={[
                {
                    title: translate('workspace.common.bills'),
                    // eslint-disable-next-line max-len
                    onPress: () => openSignedInLink(`reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"bill","states":{"Open":false,"Processing":true,"Approved":true,"Reimbursed":false,"Archived":false},"isAdvancedFilterMode":true}`),
                    icon: Bill,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.bills.VBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
