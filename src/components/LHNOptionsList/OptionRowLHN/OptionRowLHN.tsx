import React from 'react';
import {View} from 'react-native';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import OptionRow from './OptionRow';
import useOptionRowChrome from './useOptionRowChrome';

function OptionRowLHN({isOptionFocused = false, onSelectRow = () => {}, optionItem, viewMode = 'default', onLayout = () => {}, hasDraftComment, testID}: OptionRowLHNProps) {
    const styles = useThemeStyles();
    const {setHovered, sidebarInnerRowStyle, contentContainerStyles, avatarBackgroundColor} = useOptionRowChrome({
        isOptionFocused,
        viewMode,
    });

    const brickRoadIndicator = optionItem.brickRoadIndicator;

    return (
        <OptionRow.OfflineWrapper
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
        >
            <OptionRow.ProductTrainingTooltip optionItem={optionItem}>
                <OptionRow.Pressable
                    optionItem={optionItem}
                    isOptionFocused={isOptionFocused}
                    onSelectRow={onSelectRow}
                    onLayout={onLayout}
                    onHoverIn={() => setHovered(true)}
                    onHoverOut={() => setHovered(false)}
                >
                    <View style={sidebarInnerRowStyle}>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <OptionRow.Avatar
                                optionItem={optionItem}
                                viewMode={viewMode}
                                avatarBackgroundColor={avatarBackgroundColor}
                            />
                            <View style={contentContainerStyles}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                    <OptionRow.Title
                                        optionItem={optionItem}
                                        isOptionFocused={isOptionFocused}
                                        testID={testID}
                                    />
                                    <OptionRow.OnboardingBadge optionItem={optionItem} />
                                    <OptionRow.Status optionItem={optionItem} />
                                </View>
                                <OptionRow.Subtitle
                                    optionItem={optionItem}
                                    viewMode={viewMode}
                                    isOptionFocused={isOptionFocused}
                                />
                            </View>
                            <OptionRow.DescriptiveText optionItem={optionItem} />
                            <OptionRow.ErrorBadge
                                brickRoadIndicator={brickRoadIndicator}
                                actionBadge={optionItem.actionBadge}
                            />
                        </View>
                    </View>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <OptionRow.InfoBadge
                            brickRoadIndicator={brickRoadIndicator}
                            actionBadge={optionItem.actionBadge}
                        />
                        <OptionRow.DraftIndicator
                            hasDraftComment={hasDraftComment}
                            isAllowedToComment={optionItem.isAllowedToComment}
                        />
                        <OptionRow.PinIndicator
                            isPinned={optionItem.isPinned}
                            brickRoadIndicator={brickRoadIndicator}
                        />
                    </View>
                </OptionRow.Pressable>
            </OptionRow.ProductTrainingTooltip>
        </OptionRow.OfflineWrapper>
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default OptionRowLHN;
