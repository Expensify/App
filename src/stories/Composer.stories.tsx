import type {Meta} from '@storybook/react-webpack5';
// eslint-disable-next-line no-restricted-imports
import {ExpensiMark} from 'expensify-common';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import Composer from '@components/Composer';
import type {ComposerProps, CustomSelectionChangeEvent, TextSelection} from '@components/Composer/types';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import withNavigationFallback from '@components/withNavigationFallback';
import useStyleUtils from '@hooks/useStyleUtils';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import {defaultStyles} from '@src/styles';
import type {FileObject} from '@src/types/utils/Attachment';

const ComposerWithNavigation = withNavigationFallback(Composer);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ComposerWithNavigation> = {
    title: 'Components/Composer',
    component: ComposerWithNavigation,
};

const parser = new ExpensiMark();

const DEFAULT_VALUE = `Composer can do the following:

     * It can contain MD e.g. *bold* _italic_
     * Supports Pasted Images via Ctrl+V`;

function Default(props: ComposerProps) {
    const StyleUtils = useStyleUtils();
    const [pastedFile, setPastedFile] = useState<FileObject | FileObject[]>();
    const [comment, setComment] = useState(DEFAULT_VALUE);
    const renderedHTML = parser.replace(comment ?? '');
    const [selection, setSelection] = useState<TextSelection>(() => ({start: DEFAULT_VALUE.length, end: DEFAULT_VALUE.length, positionX: 0, positionY: 0}));

    return (
        <View>
            <View style={[defaultStyles.border, defaultStyles.p4]}>
                <ComposerWithNavigation
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    multiline
                    value={comment}
                    onChangeText={setComment}
                    onPasteFile={setPastedFile}
                    selection={selection}
                    onSelectionChange={(e: CustomSelectionChangeEvent) => {
                        setSelection(e.nativeEvent.selection);
                    }}
                    style={[defaultStyles.textInputCompose, defaultStyles.w100, defaultStyles.verticalAlignTop]}
                />
            </View>
            <View style={[defaultStyles.flexRow, defaultStyles.mv5, defaultStyles.flexWrap, defaultStyles.w100]}>
                <View style={[defaultStyles.border, defaultStyles.noLeftBorderRadius, defaultStyles.noRightBorderRadius, defaultStyles.p5, defaultStyles.flex1]}>
                    <Text style={[defaultStyles.mb2, defaultStyles.textLabelSupporting]}>Entered Comment (Drop Enabled)</Text>
                    <Text>{comment}</Text>
                </View>
                <View style={[defaultStyles.p5, defaultStyles.borderBottom, defaultStyles.borderRight, defaultStyles.borderTop, defaultStyles.flex1]}>
                    <Text style={[defaultStyles.mb2, defaultStyles.textLabelSupporting]}>Rendered Comment</Text>
                    {!!renderedHTML && <RenderHTML html={renderedHTML} />}
                    {!!pastedFile && pastedFile instanceof File && (
                        <View style={defaultStyles.mv3}>
                            <Image
                                source={{uri: URL.createObjectURL(pastedFile)}}
                                resizeMode="contain"
                                style={StyleUtils.getWidthAndHeightStyle(250, 250)}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

Default.args = {
    autoFocus: true,
    placeholder: 'Compose Text Here',
    placeholderTextColor: defaultTheme.placeholderText,
    isDisabled: false,
    maxLines: 16,
};

export default story;
export {Default};
