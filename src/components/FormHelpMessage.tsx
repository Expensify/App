import isEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';

type FormHelpMessageProps = {
    /** Error or hint text. Ignored when children is not empty */
    message?: string | React.ReactNode;

    /** Children to render next to dot indicator */
    children?: React.ReactNode;

    /** Indicates whether to show error or hint */
    isError?: boolean;

    /** Container style props */
    style?: StyleProp<ViewStyle>;

    /** Whether to show dot indicator */
    shouldShowRedDotIndicator?: boolean;

    /** Whether should render error text as HTML or as Text */
    shouldRenderMessageAsHTML?: boolean;

    /** Whether to show information icon */
    isInfo?: boolean;
};

function FormHelpMessage({message = '', children, isError = true, style, shouldShowRedDotIndicator = true, shouldRenderMessageAsHTML = false, isInfo = false}: FormHelpMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Exclamation']);
    const {translate} = useLocalize();

    const HTMLMessage = useMemo(() => {
        if (typeof message !== 'string' || !shouldRenderMessageAsHTML) {
            return '';
        }

        const replacedText = Parser.replace(message, {shouldEscapeText: false});

        if (isError) {
            return `<alert-text>${replacedText}</alert-text>`;
        }

        return `<muted-text-label>${replacedText}</muted-text-label>`;
    }, [isError, message, shouldRenderMessageAsHTML]);

    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}>
            {isError && shouldShowRedDotIndicator && (
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.danger}
                    accessibilityLabel={translate('common.yourReviewIsRequired')}
                />
            )}
            {isInfo && (
                <Icon
                    src={icons.Exclamation}
                    fill={theme.icon}
                    small
                    additionalStyles={[styles.mr1]}
                    accessibilityLabel={translate('common.yourReviewIsRequired')}
                />
            )}
            <View style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {children ?? (shouldRenderMessageAsHTML ? <RenderHTML html={HTMLMessage} /> : <Text style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{message}</Text>)}
            </View>
        </View>
    );
}

export default FormHelpMessage;
