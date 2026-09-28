import {useHeaderContext} from '@components/Header/context/HeaderContext';
import HeaderTitleComponent from '@components/HeaderTitle';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleProps = {
    title: string;
    subtitle?: string;
    subTitleLink?: string;
    titleStyles?: StyleProp<TextStyle>;

    /** Whether to use the taller headline style bar with the larger title font. */
    shouldUseHeadlineHeader?: boolean;
};

function HeaderTitle({title, subtitle = '', titleStyles, subTitleLink = '', shouldUseHeadlineHeader = false}: HeaderTitleProps) {
    const styles = useThemeStyles();
    const {shouldSkipFocusAfterTransition} = useHeaderContext();

    return (
        <HeaderTitleComponent
            dialogLabel={title}
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        >
            {!!title && (
                <HeaderTitleComponent.Text
                    numberOfLines={1}
                    style={[shouldUseHeadlineHeader && styles.textHeadlineH2, titleStyles]}
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
