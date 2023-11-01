import React from 'react';
import _ from 'underscore';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import editedLabelStyles from '@styles/editedLabelStyles';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const propTypes = {
    ...htmlRendererPropTypes,
    ...withLocalizePropTypes,
};

function EditedRenderer(props) {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);
    const isPendingDelete = Boolean(props.tnode.attributes.deleted !== undefined);
    return (
        <Text>
            <Text
                selectable={false}
                style={styles.userSelectNone}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                {' '}
            </Text>
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                fontSize={variables.fontSizeSmall}
                color={themeColors.textSupporting}
                style={[editedLabelStyles, isPendingDelete && styles.offlineFeedback.deleted]}
            >
                {props.translate('reportActionCompose.edited')}
            </Text>
        </Text>
    );
}

EditedRenderer.propTypes = propTypes;
EditedRenderer.displayName = 'EditedRenderer';

export default withLocalize(EditedRenderer);
