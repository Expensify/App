import { ComposerProps } from "@components/Composer/types";
import Composer from "@components/Composer";
import React, { ForwardedRef } from 'react';
import { AnimatedProps } from "react-native-reanimated";
import { TextInputProps } from "react-native";

type ComposerWithSuggestionsEditProps = {

}


function ComposerWithSuggestionsEdit(
    {
        value,
        maxLines = -1,
        onKeyPress = () => {},
        style,
        numberOfLines: numberOfLinesProp = 0,
        onSelectionChange = () => {},
        selection = {
            start: 0,
            end: 0,
        },
        onBlur = () => {},
        onFocus = () => {},
        onChangeText = () => {},
        id = undefined
    }: ComposerWithSuggestionsEditProps & ComposerProps,
    ref: ForwardedRef<React.Component<AnimatedProps<TextInputProps>>>,
) {
    return (
        <Composer
            multiline
            ref={ref}
            id={id}
            onChangeText={onChangeText} // Debounced saveDraftComment
            onKeyPress={onKeyPress}
            value={value}
            maxLines={maxLines} // This is the same that slack has
            style={style}
            onFocus={onFocus}
            onBlur={onBlur}
            selection={selection}
            onSelectionChange={onSelectionChange}
        />
    )
}

export default React.forwardRef(ComposerWithSuggestionsEdit);