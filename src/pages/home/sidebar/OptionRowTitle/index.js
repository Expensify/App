/* eslint-disable react/forbid-prop-types */
import _ from 'underscore';
import React, {memo} from 'react';
import {
    Text,
} from 'react-native';
import styles from '../../../../styles/styles';
import Tooltip from '../../../../components/Tooltip';
import propTypes from './OptionRowTitleProps';

const defaultProps = {
    style: null,
    tooltipEnabled: false,
};

const OptionRowTitle = ({
    style,
    tooltipEnabled,
    option,
}) => (
    <Text style={[styles.optionDisplayName, style]} numberOfLines={1}>
        {
            tooltipEnabled
                ? _.map(option.participantsList, (participant, index) => (
                    <>
                        <Tooltip key={index} text={participant.login}>
                            <Text>
                                {participant.displayName}
                            </Text>
                        </Tooltip>
                        {index < option.participantsList.length - 1 ? <Text>{', '}</Text> : null}
                    </>
                ))
                : option.text
        }
    </Text>
);

OptionRowTitle.propTypes = propTypes;
OptionRowTitle.defaultProps = defaultProps;
OptionRowTitle.displayName = 'OptionRowTitle';

// It it very important to use React.memo here so SectionList items will not unnecessarily re-render
export default memo(OptionRowTitle);
