import React from 'react';
import compose from '../../../../libs/compose';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import withLocalize from '../../../../components/withLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import {sidebarPropTypes, sidebarDefaultProps} from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import withNavigation from '../../../../components/withNavigation';
import withOnyxContext from '../../../../components/withOnyxContext';

// eslint-disable-next-line react/jsx-props-no-spreading
const SidebarScreen = props => <BaseSidebarScreen {...props} />;

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.defaultProps = sidebarDefaultProps;
SidebarScreen.displayName = 'SidebarScreen';

export default compose(
    withNavigation,
    withLocalize,
    withWindowDimensions,
    withOnyxContext({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SidebarScreen);
