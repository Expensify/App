import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {fontScale} from '@styles/typography';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import React from 'react';

// The library only fills `onPress` for links, and "(edited)" is never one, so it stays out of the props passed on.
function EditedRenderer({tnode, TDefaultRenderer, style, onPress, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
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
