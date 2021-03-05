/* eslint-disable react/forbid-prop-types */
import _ from 'underscore';
import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Text,
    View,
} from 'react-native';
import optionPropTypes from '../optionPropTypes';
import styles from '../../../../styles/styles';
import Tooltip from '../../../../components/Tooltip';
import hasEllipsis from '../../../../libs/hasEllipsis';

const propTypes = {
    // styles of the title
    style: PropTypes.object,

    tooltipEnabled: PropTypes.bool,

    // Option to allow the user to choose from can be type 'report' or 'user'
    option: optionPropTypes.isRequired,

};

const defaultProps = {
    style: null,
    tooltipEnabled: false,
};
class OptionRowTitle extends PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.state = {
            isEllipsisActive: false,
        };
    }

    componentDidMount() {
        this.setState({
            isEllipsisActive: this.ref.current && hasEllipsis(this.ref.current),
        });
    }

    render() {
        const {option, style, tooltipEnabled} = this.props;
        const {isEllipsisActive} = this.state;

        if (tooltipEnabled) {
            return (
                <Text style={[styles.optionDisplayName, style]} numberOfLines={1} ref={this.ref}>
                    {_.map(option.participantsList, (participant, index) => (
                        <Fragment key={index}>
                            <Tooltip key={index} text={participant.login} containerStyle={styles.dInline}>
                                <Text>
                                    {participant.displayName}
                                </Text>
                            </Tooltip>
                            {index < option.participantsList.length - 1 ? <Text>{', '}</Text> : null}
                        </Fragment>
                    ))}
                    {
                        isEllipsisActive
                            ? (
                                <View style={styles.optionDisplayNameTooltipEllipsis}>
                                    <Tooltip text={option.tooltipText}>
                                        <Text>...</Text>
                                    </Tooltip>
                                </View>
                            ) : null
                    }
                </Text>
            );
        }

        return <Text style={[styles.optionDisplayName, style]} numberOfLines={1}>{option.text}</Text>;
    }
}
OptionRowTitle.propTypes = propTypes;
OptionRowTitle.defaultProps = defaultProps;
OptionRowTitle.displayName = 'OptionRowTitle';

export default OptionRowTitle;
