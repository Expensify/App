import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import Composer from '@components/Composer';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import withNavigationFallback from '@components/withNavigationFallback';
import useStyleUtils from '@hooks/useStyleUtils';
import {defaultStyles} from '@styles/index';
import {defaultTheme} from '@styles/theme';
import CONST from '@src/CONST';

const ComposerWithNavigation = withNavigationFallback(Composer);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Composer',
    component: ComposerWithNavigation,
};

const parser = new ExpensiMark();

function Default(args) {
    const StyleUtils = useStyleUtils();
    const [pastedFile, setPastedFile] = useState(null);
    const [comment, setComment] = useState(args.defaultValue);
    const renderedHTML = parser.replace(comment);

    return (
        <View>
            <View style={[defaultStyles.border, defaultStyles.p4]}>
                <ComposerWithNavigation
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...args}
                    multiline
                    onChangeText={setComment}
                    onPasteFile={setPastedFile}
                    style={[defaultStyles.textInputCompose, defaultStyles.w100, defaultStyles.verticalAlignTop]}
                />
            </View>
            <View style={[defaultStyles.flexRow, defaultStyles.mv5, defaultStyles.flexWrap, defaultStyles.w100]}>
                <View
                    style={[defaultStyles.border, defaultStyles.noLeftBorderRadius, defaultStyles.noRightBorderRadius, defaultStyles.p5, defaultStyles.flex1]}
                    id={CONST.REPORT.DROP_NATIVE_ID}
                >
                    <Text style={[defaultStyles.mb2, defaultStyles.textLabelSupporting]}>Entered Comment (Drop Enabled)</Text>
                    <Text>{comment}</Text>
                </View>
                <View style={[defaultStyles.p5, defaultStyles.borderBottom, defaultStyles.borderRight, defaultStyles.borderTop, defaultStyles.flex1]}>
                    <Text style={[defaultStyles.mb2, defaultStyles.textLabelSupporting]}>Rendered Comment</Text>
                    {Boolean(renderedHTML) && <RenderHTML html={renderedHTML} />}
                    {Boolean(pastedFile) && (
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
    defaultValue: `Composer can do the following:

     * It can contain MD e.g. *bold* _italic_
     * Supports Pasted Images via Ctrl+V`,
    isDisabled: false,
    maxLines: 16,
};

export default story;
export {Default};
