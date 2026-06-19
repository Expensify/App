import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {PopoverComponentProps} from './FilterPopupButton';
import FilterPopupButton from './FilterPopupButton';

type MembersFilterButtonProps = WithSentryLabel & {
    /** The label to display on the filter button */
    label: string;

    /** The component to render in the popover */
    PopoverComponent: (props: PopoverComponentProps) => React.ReactNode;

    /** Whether a search bar is shown next to the filter button */
    shouldShowSearchBar: boolean;
};

function MembersFilterButton({label, PopoverComponent, shouldShowSearchBar, sentryLabel}: MembersFilterButtonProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexGrow0, styles.flexShrink0, styles.mnw0, styles.overflowHidden, shouldShowSearchBar ? styles.mw50 : styles.mw100]}>
            <FilterPopupButton
                wrapperStyle={[styles.flexGrow0, styles.flexShrink0, styles.mnw0, styles.mw100]}
                PopoverComponent={PopoverComponent}
                renderButton={({onPress, ref, isExpanded}) => (
                    <Button
                        ref={ref}
                        medium
                        innerStyles={[isExpanded && styles.buttonHoveredBG, styles.gap2, styles.mw100, styles.flexShrink1, styles.mnw0]}
                        onPress={onPress}
                        sentryLabel={sentryLabel}
                    >
                        <CaretWrapper
                            style={[styles.flexShrink1, styles.mnw0, styles.mw100, styles.gap2]}
                            caretWidth={variables.iconSizeSmall}
                            caretHeight={variables.iconSizeSmall}
                            isActive={isExpanded}
                        >
                            <View style={[styles.flexShrink1, styles.mnw0, styles.overflowHidden]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.textMicroBold, styles.fontSizeLabel]}
                                >
                                    {label}
                                </Text>
                            </View>
                        </CaretWrapper>
                    </Button>
                )}
            />
        </View>
    );
}

export default MembersFilterButton;
export type {MembersFilterButtonProps};
