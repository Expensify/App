import _ from 'underscore';
import React from 'react';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import ExpensifyText from '../../ExpensifyText';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import styles from '../../../styles/styles';

const propTypes = {
    ...htmlRendererPropTypes,
    ...withLocalizePropTypes,
};

const EditedRenderer = (props) => {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);
    return (
        <ExpensifyText
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
            fontSize={variables.fontSizeSmall}
            color={themeColors.textSupporting}
        >
            {/* Native devices do not support margin between nested text */}
            <ExpensifyText style={styles.w1}>{' '}</ExpensifyText>
            {props.translate('reportActionCompose.edited')}
        </ExpensifyText>
    );
};

EditedRenderer.propTypes = propTypes;
EditedRenderer.displayName = 'EditedRenderer';

export default withLocalize(EditedRenderer);
