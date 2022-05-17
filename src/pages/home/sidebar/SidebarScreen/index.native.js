import React from 'react';
import {withNavigation} from '@react-navigation/compat';
import {withOnyx} from 'react-native-onyx';
import compose from '../../../../libs/compose';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import withLocalize from '../../../../components/withLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import propTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';

// eslint-disable-next-line react/jsx-props-no-spreading
const SidebarScreen = props => <BaseSidebarScreen {...props} />;

SidebarScreen.propTypes = propTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default compose(
    withNavigation,
    withLocalize,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isCreatingWorkspace: {
            key: ONYXKEYS.IS_CREATING_WORKSPACE,
        },
    }),
)(SidebarScreen);
