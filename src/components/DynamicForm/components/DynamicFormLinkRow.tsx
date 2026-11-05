/** A link between the fields of a schema-driven form, such as one to a help article, drawn like the help links of the other bank account forms */
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import Icon from '@components/Icon';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {DynamicFormLink} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type DynamicFormLinkRowProps = {
    link: DynamicFormLink;
};

function DynamicFormLinkRow({link}: DynamicFormLinkRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['QuestionMark']);
    const text = getLocalizedText(translate, link.textKey, link.text);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}>
            <Icon
                src={icons.QuestionMark}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
                fill={theme.icon}
            />
            <TextLink
                style={[styles.textMicro, styles.ml2]}
                href={link.url}
            >
                {text}
            </TextLink>
        </View>
    );
}

export default DynamicFormLinkRow;
