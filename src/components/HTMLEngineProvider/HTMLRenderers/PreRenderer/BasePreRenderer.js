import PropTypes from 'prop-types';
import React, {forwardRef} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import htmlRendererPropTypes from '@components/HTMLEngineProvider/HTMLRenderers/htmlRendererPropTypes';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import withLocalize from '@components/withLocalize';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

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

const BasePreRenderer = forwardRef((props, ref) => {
    const styles = useThemeStyles();
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'onPressIn', 'onPressOut', 'onLongPress']);
    const isLast = props.renderIndex === props.renderLength - 1;

    return (
        <ScrollView
            ref={ref}
            horizontal
            style={[isLast ? styles.mt2 : styles.mv2, styles.overscrollBehaviorXNone]}
            bounces={false}
            keyboardShouldPersistTaps="always"
        >
            <ShowContextMenuContext.Consumer>
                {({anchor, report, action, checkIfContextMenuActive}) => (
                    <PressableWithoutFeedback
                        onPressIn={props.onPressIn}
                        onPressOut={props.onPressOut}
                        onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
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
