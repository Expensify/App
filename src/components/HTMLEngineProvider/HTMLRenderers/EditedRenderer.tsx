import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {fontScale} from '@styles/typography';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import React from 'react';

function EditedRenderer({tnode, TDefaultRenderer, style, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isPendingDelete = !!(tnode.attributes.deleted !== undefined);
    return (
        <Text fontSize={fontScale.micro}>
            <Text fontSize={fontScale.micro}> </Text>
            <Text
                {...defaultRendererProps}
                fontSize={fontScale.micro}
                color={theme.textSupporting}
                style={[styles.editedLabelStyles, isPendingDelete && styles.offlineFeedbackDeleted]}
            >
                {translate('reportActionCompose.edited')}
            </Text>
        </Text>
    );
}

export default EditedRenderer;
