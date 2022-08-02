import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import ROUTES from '../../../ROUTES';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';
import Button from '../../../components/Button';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import * as WorkSpaceUtils from '../WorkSpaceUtils';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsNoVBAView = props => (
    <>
        <WorkspaceBillsFirstSection policyID={props.policyID} />

        <Section
            title={props.translate('workspace.bills.unlockOnlineBillPayment')}
            icon={Illustrations.JewelBoxPink}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.bills.unlockNoVBACopy')}</Text>
            </View>
            <Button
                text={props.translate('workspace.common.bankAccount')}
                onPress={() => {
                    WorkSpaceUtils.getShouldShowBankOrNonAccountPage(props.reimbursementAccount, props.policyID);
                }}
                icon={Expensicons.Bank}
                style={[styles.mt4]}
                iconStyles={[styles.mr5]}
                shouldShowRightIcon
                extraLarge
                success
            />
        </Section>
    </>
);

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceBillsNoVBAView);
