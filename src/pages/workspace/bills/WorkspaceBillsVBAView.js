import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceBillsVBAView(props) {
    const styles = useThemeStyles();
    const reportsUrl = `reports?policyID=${props.policyID}&from=all&type=bill&showStates=Processing,Approved&isAdvancedFilterMode=true`;

    return (
        <>
            <WorkspaceBillsFirstSection policyID={props.policyID} />

            <Section
                title={props.translate('workspace.bills.hassleFreeBills')}
                icon={Illustrations.MoneyBadge}
                menuItems={[
                    {
                        title: props.translate('workspace.common.bills'),
                        onPress: () => Link.openOldDotLink(reportsUrl),
                        icon: Expensicons.Bill,
                        shouldShowRightIcon: true,
                        iconRight: Expensicons.NewWindow,
                        wrapperStyle: [styles.cardMenuItem],
                        link: () => Link.buildOldDotURL(reportsUrl),
                    },
                ]}
            >
                <View style={[styles.mv3]}>
                    <Text>{props.translate('workspace.bills.VBACopy')}</Text>
                </View>
            </Section>
        </>
    );
}

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
