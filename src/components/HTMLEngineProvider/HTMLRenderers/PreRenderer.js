import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import withLocalize from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const propTypes = {
    /** Press in handler for the code block */
    onPressIn: PropTypes.func,

    /** Press out handler for the code block */
    onPressOut: PropTypes.func,

    /** The position of this React element relative to the parent React element, starting at 0 */
    renderIndex: PropTypes.number.isRequired,

    /** The total number of elements children of this React element parent */
    renderLength: PropTypes.number.isRequired,

    ...htmlRendererPropTypes,
};

const defaultProps = {
    onPressIn: undefined,
    onPressOut: undefined,
};

function PreRenderer(props) {
    const styles = useThemeStyles();
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'onPressIn', 'onPressOut', 'onLongPress']);
    const isLast = props.renderIndex === props.renderLength - 1;

    return (
        <View style={[isLast ? styles.mt2 : styles.mv2]}>
            <ShowContextMenuContext.Consumer>
                {({anchor, report, action, checkIfContextMenuActive}) => (
                    <PressableWithoutFeedback
                        onPressIn={props.onPressIn}
                        onPressOut={props.onPressOut}
                        onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                        role={CONST.ROLE.PRESENTATION}
                        accessibilityLabel={props.translate('accessibilityHints.prestyledText')}
                    >
                        <View>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <TDefaultRenderer {...defaultRendererProps} />
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </View>
    );
}

PreRenderer.displayName = 'PreRenderer';
PreRenderer.propTypes = propTypes;
PreRenderer.defaultProps = defaultProps;

export default withLocalize(PreRenderer);
