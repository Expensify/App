import {useHeaderContext} from '@components/Header/context/HeaderContext';
import HeaderTitleComponent from '@components/HeaderTitle';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleProps = {
    title?: string;
    subtitle?: string;
    subtitleLink?: string;
    titleStyles?: StyleProp<TextStyle>;
};

function HeaderTitle({title, subtitle, titleStyles, subtitleLink}: HeaderTitleProps) {
    const {shouldSkipFocusAfterTransition} = useHeaderContext();

    return (
        <HeaderTitleComponent
            dialogLabel={title}
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        >
            {!!title && (
                <HeaderTitleComponent.Text
                    numberOfLines={1}
                    style={[titleStyles]}
                >
                    {title}
                </HeaderTitleComponent.Text>
            )}
            {!!subtitle && <HeaderTitleComponent.Subtitle>{subtitle}</HeaderTitleComponent.Subtitle>}
            {!!subtitleLink && <HeaderTitleComponent.SubtitleLink>{subtitleLink}</HeaderTitleComponent.SubtitleLink>}
        </HeaderTitleComponent>
    );
}

export default HeaderTitle;
