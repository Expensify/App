import React from 'react';
import compose from '../../../../libs/compose';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import withLocalize from '../../../../components/withLocalize';
import {sidebarPropTypes, sidebarDefaultProps} from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import withNavigation from '../../../../components/withNavigation';
import {withBetas, withPolicyCollection} from '../../../../components/OnyxProvider';

// eslint-disable-next-line react/jsx-props-no-spreading
const SidebarScreen = props => <BaseSidebarScreen {...props} />;

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.defaultProps = sidebarDefaultProps;
SidebarScreen.displayName = 'SidebarScreen';

export default compose(
    withNavigation,
    withLocalize,
    withWindowDimensions,
    withPolicyCollection({propName: 'allPolicies'}),
    withBetas(),
)(SidebarScreen);
