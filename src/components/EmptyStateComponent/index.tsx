import isEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';
import type {EmptyStateComponentProps} from './types';

function EmptyStateComponent({
    headerMedia,
    buttons,
    containerStyles,
    title,
    titleStyles,
    subtitle,
    children,
    headerStyles,
    cardStyles,
    cardContentStyles,
    headerContentStyles,
    minModalHeight = 400,
    subtitleText,
}: EmptyStateComponentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const doesSubtitleContainCustomEmojiAndMore = containsCustomEmoji(subtitle ?? '') && !containsOnlyCustomEmoji(subtitle ?? '');
    const hasMultipleButtons = buttons && buttons.length > 1;

    const HeaderComponent = useMemo(
        () => (
            <ImageSVG
                style={StyleSheet.flatten(headerContentStyles)}
                src={headerMedia}
            />
        ),
        [headerMedia, headerContentStyles],
    );

    return (
        <View style={[{minHeight: minModalHeight}, styles.flexGrow1, styles.flexShrink0, containerStyles]}>
            <View style={styles.emptyStateForeground}>
                <View style={[styles.emptyStateContent, cardStyles]}>
                    <View style={[styles.emptyStateHeader, headerStyles]}>{HeaderComponent}</View>
                    <View style={[styles.ph2, styles.pb2, cardContentStyles]}>
                        <Text
                            style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2, titleStyles]}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {title}
                        </Text>
                        {subtitleText ??
                            (doesSubtitleContainCustomEmojiAndMore ? (
                                <TextWithEmojiFragment
                                    style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}
                                    message={subtitle}
                                />
                            ) : (
                                <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{subtitle}</Text>
                            ))}
                        {children}
                        {!isEmpty(buttons) && (
                            <View
                                style={[
                                    styles.gap2,
                                    styles.mt6,
                                    shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow,
                                    shouldUseNarrowLayout ? styles.ph5 : styles.ph8,
                                    styles.flexWrap,
                                    styles.justifyContentCenter,
                                    styles.alignItemsCenter,
                                    styles.mw400p,
                                    styles.alignSelfCenter,
                                    (hasMultipleButtons || !shouldUseNarrowLayout) && styles.w100,
                                ]}
                            >
                                {buttons?.map(({buttonText, buttonAction, success, icon, isDisabled, style, dropDownOptions}) =>
                                    dropDownOptions ? (
                                        <ButtonWithDropdownMenu
                                            key={buttonText}
                                            onPress={() => {}}
                                            shouldAlwaysShowDropdownMenu
                                            customText={buttonText}
                                            options={dropDownOptions}
                                            isSplitButton={false}
                                            style={[hasMultipleButtons && (shouldUseNarrowLayout ? styles.w100 : styles.flex1), style]}
                                        />
                                    ) : (
                                        <Button
                                            key={buttonText}
                                            success={success}
                                            onPress={buttonAction}
                                            text={buttonText}
                                            icon={icon}
                                            large
                                            isDisabled={isDisabled}
                                            style={[hasMultipleButtons && (shouldUseNarrowLayout ? styles.w100 : styles.flex1), style]}
                                        />
                                    ),
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

export default EmptyStateComponent;
