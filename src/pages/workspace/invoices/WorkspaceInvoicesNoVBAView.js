import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeIllustrations from '@styles/illustrations/useThemeIllustrations';
import useThemeStyles from '@styles/useThemeStyles';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceInvoicesNoVBAView(props) {
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    return (
        <>
            <WorkspaceInvoicesFirstSection policyID={props.policyID} />

            <Section
                title={props.translate('workspace.invoices.unlockOnlineInvoiceCollection')}
                icon={illustrations.MoneyIntoWallet}
                containerStyles={[styles.cardSection]}
            >
                <View style={[styles.mv3]}>
                    <Text>{props.translate('workspace.invoices.unlockNoVBACopy')}</Text>
                </View>
                <ConnectBankAccountButton
                    policyID={props.policyID}
                    style={[styles.mt4]}
                />
            </Section>
        </>
    );
}

WorkspaceInvoicesNoVBAView.propTypes = propTypes;
WorkspaceInvoicesNoVBAView.displayName = 'WorkspaceInvoicesNoVBAView';

export default withLocalize(WorkspaceInvoicesNoVBAView);
