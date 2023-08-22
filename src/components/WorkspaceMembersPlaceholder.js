import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import OptionsListSkeletonView from './OptionsListSkeletonView';

const propTypes = {
    isLoaded: PropTypes.bool,
    emptyText: PropTypes.string,
};

const defaultProps = {
    isLoaded: false,
    emptyText: undefined,
};

function WorkspaceMembersPlaceholder({isLoaded, emptyText}) {
    return isLoaded && emptyText ? (
        <View style={[styles.ph5]}>
            <Text style={[styles.textLabel, styles.colorMuted]}>{emptyText}</Text>
        </View>
    ) : (
        <OptionsListSkeletonView shouldAnimate />
    );
}

WorkspaceMembersPlaceholder.displayName = 'WorkspaceMembersPlaceholder';
WorkspaceMembersPlaceholder.propTypes = propTypes;
WorkspaceMembersPlaceholder.defaultProps = defaultProps;

export default WorkspaceMembersPlaceholder;
