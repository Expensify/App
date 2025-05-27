import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import Button from './Button';
import type {ButtonProps} from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceActionType, WorkspaceBulkActionType, WorkspaceMemberBulkActionType} from './ButtonWithDropdownMenu/types';
import HeaderWithBackButton from './HeaderWithBackButton';
import type HeaderWithBackButtonProps from './HeaderWithBackButton/types';

type PrimaryButtonProps = Pick<ButtonProps, 'icon' | 'innerStyles' | 'success' | 'text' | 'onPress'>;

type WorkspaceHeaderProps = {
    bulkActionButtonOptions: Array<DropdownOption<DeepValueOf<WorkspaceBulkActionType | WorkspaceMemberBulkActionType>>>;
    bulkActionButtonTestID?: string;
    bulkActionButtonText?: string;
    shouldShowPrimaryButton?: boolean;
    primaryButtonProps: PrimaryButtonProps;
    shouldShowMoreButton?: boolean;
    moreButtonOptions: Array<DropdownOption<DeepValueOf<WorkspaceActionType>>>;
    moreButtonTestID?: string;
    selected: number;
} & Pick<HeaderWithBackButtonProps, 'icon' | 'shouldShowBackButton' | 'shouldUseHeadlineHeader' | 'title' | 'onBackButtonPress'>;

function WorkspaceHeader({
    bulkActionButtonOptions = [],
    bulkActionButtonTestID,
    bulkActionButtonText,
    shouldShowPrimaryButton,
    primaryButtonProps = {},
    shouldShowMoreButton,
    moreButtonOptions,
    moreButtonTestID,
    selected = 0,
    icon,
    shouldShowBackButton,
    shouldUseHeadlineHeader,
    title,
    onBackButtonPress,
}: WorkspaceHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectionMode} = useMobileSelectionMode();
    const canSelectMultiple = selectionMode?.isEnabled;

    const getHeaderButtons = () => {
        if (shouldUseNarrowLayout ? canSelectMultiple : selected > 0) {
            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    isSplitButton={false}
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={bulkActionButtonText}
                    options={bulkActionButtonOptions}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selected}
                    testID={bulkActionButtonTestID}
                />
            );
        }

        return !!shouldShowPrimaryButton || (shouldShowMoreButton && moreButtonOptions.length > 0) ? (
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                {!!shouldShowPrimaryButton && (
                    <Button
                        text={primaryButtonProps.text}
                        icon={primaryButtonProps.icon}
                        success={primaryButtonProps.success ?? true}
                        innerStyles={primaryButtonProps.innerStyles}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                        onPress={primaryButtonProps.onPress}
                    />
                )}
                {!!shouldShowMoreButton && moreButtonOptions.length > 0 && (
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        success={false}
                        shouldAlwaysShowDropdownMenu
                        pressOnEnter
                        isSplitButton={false}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        customText={translate('common.more')}
                        options={moreButtonOptions}
                        style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                        testID={moreButtonTestID}
                    />
                )}
            </View>
        ) : null;
    };

    return (
        <View>
            <HeaderWithBackButton
                shouldShowBackButton={shouldUseNarrowLayout || shouldShowBackButton}
                title={title}
                icon={icon}
                shouldUseHeadlineHeader={shouldUseHeadlineHeader}
                onBackButtonPress={onBackButtonPress}
                shouldShowThreeDotsButton={false}
            >
                {!shouldUseNarrowLayout && getHeaderButtons()}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
        </View>
    );
}

export default WorkspaceHeader;

export type {WorkspaceHeaderProps};
