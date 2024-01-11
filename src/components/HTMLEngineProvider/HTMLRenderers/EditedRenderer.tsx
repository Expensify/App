import React from 'react';
import Text from '@components/Text';
import withLocalize from '@components/withLocalize';
import type {WithLocalizeProps} from '@components/withLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type HtmlRendererProps from './types';

type EditedRendererProps = WithLocalizeProps & HtmlRendererProps;

function EditedRenderer({key, tnode, translate}: EditedRendererProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const defaultRendererProps = {key};
    const isPendingDelete = Boolean(tnode.attributes.deleted !== undefined);
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
                style={[styles.editedLabelStyles, isPendingDelete && styles.offlineFeedback.deleted]}
            >
                {translate('reportActionCompose.edited')}
            </Text>
        </Text>
    );
}

EditedRenderer.displayName = 'EditedRenderer';

export default withLocalize(EditedRenderer);
