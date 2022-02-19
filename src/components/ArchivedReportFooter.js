import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The reason this report was archived. */
    archivedReason: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const ArchivedReportFooter = (props) => {
    // const getTranslationKeyForArchivedReason = () => {};
    // const message = props.translate(getTranslationKeyForArchivedReason(props.archivedReason));
    const message = props.translate('reportActionCompose.roomIsArchived');
    return (
        <View style={[styles.p5, styles.hoveredComponentBG]}>
            <View style={[styles.flexRow]}>
                {/* TODO: translate archivedReason */}
                <Text>{message}</Text>
                <Tooltip text="TODO: get translated message for archived chat info icon">
                    <Pressable onPress={() => { /* TODO: What does clicking the ! icon do? */ }}>
                        {({pressed, hovered}) => (
                            <Icon
                                src={Expensicons.Exclamation}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        )}
                    </Pressable>
                </Tooltip>
            </View>
        </View>
    );
};

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withLocalize(ArchivedReportFooter);
