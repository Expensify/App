import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Hoverable from './Hoverable';
import Text from './Text';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The reason this report was archived. */
    archiveReason: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const ArchivedReportFooter = (props) => {
    // const getTranslationKeyForArchiveReason = () => {};
    // const message = props.translate(getTranslationKeyForArchiveReason(props.archiveReason));
    const message = props.translate('reportActionCompose.roomIsArchived');
    return (
        <Hoverable containerStyles={[styles.flexRow, styles.p5]}>
            {isHovered => (
                <View style={isHovered ? styles.activeComponentBG : styles.hoveredComponentBG}>
                    <Text>{message}</Text>
                    <Icon
                        src={Expensicons.Exclamation}
                        fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                    />
                </View>
            )}
        </Hoverable>
    );
};

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withLocalize(ArchivedReportFooter);
