import React from 'react';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function EditedRenderer({tnode, TDefaultRenderer, style, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isPendingDelete = !!(tnode.attributes.deleted !== undefined);
    return (
        <Text fontSize={variables.fontSizeSmall}>
            <Text fontSize={variables.fontSizeSmall}> </Text>
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                fontSize={variables.fontSizeSmall}
                color={theme.textSupporting}
                style={[styles.editedLabelStyles, isPendingDelete && styles.offlineFeedbackDeleted]}
            >
                {translate('reportActionCompose.edited')}
            </Text>
        </Text>
    );
}

export default EditedRenderer;
