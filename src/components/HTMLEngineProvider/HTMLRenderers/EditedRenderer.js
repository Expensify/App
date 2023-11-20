import React from 'react';
import _ from 'underscore';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import editedLabelStyles from '@styles/editedLabelStyles';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const propTypes = {
    ...htmlRendererPropTypes,
    ...withLocalizePropTypes,
};

function EditedRenderer(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);
    const isPendingDelete = Boolean(props.tnode.attributes.deleted !== undefined);
    return (
        <Text>
            <Text
                style={styles.userSelectNone}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                {' '}
            </Text>
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                fontSize={variables.fontSizeSmall}
                color={theme.textSupporting}
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
