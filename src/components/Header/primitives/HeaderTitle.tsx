import {useHeaderContext} from '@components/Header/context/HeaderContext';
import HeaderTitleComponent from '@components/HeaderTitle';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleProps = {
    title: string;
    subtitle?: string;
    subTitleLink?: string;
    titleStyles?: StyleProp<TextStyle>;
};

function HeaderTitle({title, subtitle = '', titleStyles, subTitleLink = ''}: HeaderTitleProps) {
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
            {!!subTitleLink && <HeaderTitleComponent.SubtitleLink>{subTitleLink}</HeaderTitleComponent.SubtitleLink>}
        </HeaderTitleComponent>
    );
}

export default HeaderTitle;
