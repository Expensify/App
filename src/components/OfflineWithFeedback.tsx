import React, {useCallback} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import mapChildrenFlat from '@libs/mapChildrenFlat';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import type {AllStyles} from '@styles/utils/types';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CustomStylesForChildrenProvider from './CustomStylesForChildrenProvider';
import ErrorMessageRow from './ErrorMessageRow';

/**
 * This component should be used when we are using the offline pattern B (offline with feedback).
 * You should enclose any element that should have feedback that the action was taken offline and it will take
 * care of adding the appropriate styles for pending actions and displaying the dismissible error.
 */

type OfflineWithFeedbackProps = ChildrenProps & {
    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction | null;

    /** Determine whether to hide the component's children if deletion is pending */
    shouldHideOnDelete?: boolean;

    /** The errors to display  */
    errors?: OnyxCommon.Errors | ReceiptErrors | null;

    /** Whether we should show the error messages */
    shouldShowErrorMessages?: boolean;

    /** Whether we should disable opacity */
    shouldDisableOpacity?: boolean;

    /** A function to run when the X button next to the error is clicked */
    onClose?: () => void;

    /** Additional styles to add after local styles. Applied to the parent container */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to add after local styles. Applied to the children wrapper container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** Whether applying strikethrough to the children should be disabled */
    shouldDisableStrikeThrough?: boolean;

    /** Whether to apply needsOffscreenAlphaCompositing prop to the children */
    needsOffscreenAlphaCompositing?: boolean;

    /** Whether we can dismiss the error message */
    canDismissError?: boolean;

    /** Whether we should render the error message above the children */
    shouldDisplayErrorAbove?: boolean;
};

type StrikethroughProps = Partial<ChildrenProps> & {style: AllStyles[]};

function OfflineWithFeedback({
    pendingAction,
    canDismissError = true,
    contentContainerStyle,
    errorRowStyles,
    errors,
    needsOffscreenAlphaCompositing = false,
    onClose = () => {},
    shouldDisableOpacity = false,
    shouldDisableStrikeThrough = false,
    shouldHideOnDelete = true,
    shouldShowErrorMessages = true,
    style,
    shouldDisplayErrorAbove = false,
    ...rest
}: OfflineWithFeedbackProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();

    const hasErrors = !isEmptyObject(errors ?? {});

    const isOfflinePendingAction = !!isOffline && !!pendingAction;
    const isUpdateOrDeleteError = hasErrors && (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    const isAddError = hasErrors && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const needsOpacity = !shouldDisableOpacity && ((isOfflinePendingAction && !isUpdateOrDeleteError) || isAddError);
    const needsStrikeThrough = !shouldDisableStrikeThrough && isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const hideChildren = shouldHideOnDelete && !isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !hasErrors;
    let children = rest.children;

    /**
     * This method applies the strikethrough to all the children passed recursively
     */
    const applyStrikeThrough = useCallback(
        (childrenProp: React.ReactNode): React.ReactNode => {
            const strikedThroughChildren = mapChildrenFlat(childrenProp, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }

                type ChildComponentProps = ChildrenProps & {style?: AllStyles};
                const childProps = child.props as ChildComponentProps;
                const props: StrikethroughProps = {
                    style: StyleUtils.combineStyles(childProps.style ?? [], styles.offlineFeedback.deleted, styles.userSelectNone),
                };

                if (childProps.children) {
                    props.children = applyStrikeThrough(childProps.children);
                }

                return React.cloneElement(child, props);
            });

            return strikedThroughChildren;
        },
        [StyleUtils, styles],
    );

    // Apply strikethrough to children if needed, but skip it if we are not going to render them
    if (needsStrikeThrough && !hideChildren) {
        children = applyStrikeThrough(children);
    }
    return (
        <View style={style}>
            {shouldShowErrorMessages && shouldDisplayErrorAbove && (
                <ErrorMessageRow
                    errors={errors}
                    errorRowStyles={errorRowStyles}
                    onClose={onClose}
                    canDismissError={canDismissError}
                />
            )}
            {!hideChildren && (
                <View
                    style={[needsOpacity ? styles.offlineFeedback.pending : {}, contentContainerStyle]}
                    needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOpacity && needsOffscreenAlphaCompositing : undefined}
                >
                    <CustomStylesForChildrenProvider style={needsStrikeThrough ? [styles.offlineFeedback.deleted, styles.userSelectNone] : null}>{children}</CustomStylesForChildrenProvider>
                </View>
            )}
            {shouldShowErrorMessages && !shouldDisplayErrorAbove && (
                <ErrorMessageRow
                    errors={errors}
                    errorRowStyles={errorRowStyles}
                    onClose={onClose}
                    canDismissError={canDismissError}
                />
            )}
        </View>
    );
}

OfflineWithFeedback.displayName = 'OfflineWithFeedback';

export default OfflineWithFeedback;
export type {OfflineWithFeedbackProps};
