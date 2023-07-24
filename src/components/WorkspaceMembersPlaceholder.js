import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import OptionsListSkeletonView from './OptionsListSkeletonView';

const propTypes = {
    dataLoaded: PropTypes.bool,
    dataEmptyText: PropTypes.string,
};

const defaultProps = {
    dataLoaded: false,
    dataEmptyText: undefined,
};

function WorkspaceMembersPlaceholder(props) {
    return props.dataLoaded && props.dataEmptyText ? (
        <View style={[styles.ph5]}>
            <Text style={[styles.textLabel, styles.colorMuted]}>{props.dataEmptyText}</Text>
        </View>
    ) : (
        <OptionsListSkeletonView shouldAnimate />
    );
}

WorkspaceMembersPlaceholder.displayName = 'WorkspaceMembersPlaceholder';
WorkspaceMembersPlaceholder.propTypes = propTypes;
WorkspaceMembersPlaceholder.defaultProps = defaultProps;

export default WorkspaceMembersPlaceholder;
