import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import withLocalize from '../../../withLocalize';
import {ShowContextMenuContext, showContextMenuForReport} from '../../../ShowContextMenuContext';
import styles from '../../../../styles/styles';
import * as ReportUtils from '../../../../libs/ReportUtils';
import PressableWithoutFeedback from '../../../Pressable/PressableWithoutFeedback';
import CONST from '../../../../CONST';

const propTypes = {
    /** Press in handler for the code block */
    onPressIn: PropTypes.func,

    /** Press out handler for the code block */
    onPressOut: PropTypes.func,

    ...htmlRendererPropTypes,
};

const defaultProps = {
    onPressIn: undefined,
    onPressOut: undefined,
};

const BasePreRenderer = forwardRef((props, ref) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'onPressIn', 'onPressOut', 'onLongPress']);

    return (
        <ScrollView
            ref={ref}
            horizontal
            style={[styles.mv2, styles.overscrollBehaviorXNone]}
            bounces={false}
        >
            <ShowContextMenuContext.Consumer>
                {({anchor, report, action, checkIfContextMenuActive}) => (
                    <PressableWithoutFeedback
                        onPressIn={props.onPressIn}
                        onPressOut={props.onPressOut}
                        onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        accessibilityLabel={props.translate('accessibilityHints.prestyledText')}
                    >
                        <View>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <TDefaultRenderer {...defaultRendererProps} />
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </ScrollView>
    );
});

BasePreRenderer.displayName = 'BasePreRenderer';
BasePreRenderer.propTypes = propTypes;
BasePreRenderer.defaultProps = defaultProps;

export default withLocalize(BasePreRenderer);
