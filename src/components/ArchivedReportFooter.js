import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Hoverable from './Hoverable';
import RenderHTML from './RenderHTML';
import Text from './Text';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The reason this report was archived. */
    archiveReason: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    archiveReason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
};

const ArchivedReportFooter = props => (
    <Hoverable>
        {isHovered => (
            <View style={[
                styles.flexRow,
                styles.alignItemsCenter,
                styles.p5,
                styles.borderRadiusNormal,
                isHovered ? styles.activeComponentBG : styles.hoveredComponentBG,
            ]}
            >
                <View style={[styles.mr3]}>
                    <Icon
                        src={Expensicons.Exclamation}
                        fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                    />
                </View>
                {
                    props.archiveReason === CONST.REPORT.ARCHIVE_REASON.DEFAULT
                        ? <Text>{props.translate(`reportArchiveReasons.${props.archiveReason}`)}</Text>

                        // TODO: pass displayName, policyName, and other parameters to translate()
                        : <RenderHTML html={props.translate(`reportArchiveReasons.${props.archiveReason}`)} />
                }
            </View>
        )}
    </Hoverable>
);

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.defaultProps = defaultProps;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withLocalize(ArchivedReportFooter);
