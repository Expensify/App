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
    return (
        <Hoverable>
            {isHovered => (
                <View style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.p5,
                    styles.borderRadiusNormal,
                    isHovered ? styles.activeComponentBG : styles.hoveredComponentBG,
                ]}
                >
                    {/* TODO: pass displayName, policyName, and other parameters to translate() */}
                    <Text>{props.translate(`reportArchiveReasons.${props.archiveReason}`)}</Text>
                    <View style={[styles.ml3]}>
                        <Icon
                            src={Expensicons.Exclamation}
                            fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                        />
                    </View>
                </View>
            )}
        </Hoverable>
    );
};

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withLocalize(ArchivedReportFooter);
