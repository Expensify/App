import React, {useCallback} from 'react';
import {ImageStyle, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import CONST from '@src/CONST';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import {isNotEmptyObject} from '@src/types/utils/EmptyObject';
import MessagesRow from './MessagesRow';

/**
 * This component should be used when we are using the offline pattern B (offline with feedback).
 * You should enclose any element that should have feedback that the action was taken offline and it will take
 * care of adding the appropriate styles for pending actions and displaying the dismissible error.
 */

type OfflineWithFeedbackProps = ChildrenProps & {
    /** The type of action that's pending  */
    pendingAction: OnyxCommon.PendingAction;

    /** Determine whether to hide the component's children if deletion is pending */
    shouldHideOnDelete?: boolean;

    /** The errors to display  */
    errors?: OnyxCommon.Errors;

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
};

type StrikethroughProps = Partial<ChildrenProps> & {style: Array<ViewStyle | TextStyle | ImageStyle>};

function omitBy<T>(obj: Record<string, T> | undefined, predicate: (value: T) => boolean) {
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
    return Object.fromEntries(Object.entries(obj ?? {}).filter(([_, value]) => !predicate(value)));
}

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
    ...rest
}: OfflineWithFeedbackProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();

    const hasErrors = isNotEmptyObject(errors ?? {});
    // Some errors have a null message. This is used to apply opacity only and to avoid showing redundant messages.
    const errorMessages = omitBy(errors, (e) => e === null);
    const hasErrorMessages = isNotEmptyObject(errorMessages);
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
        (childrenProp: React.ReactNode): React.ReactNode =>
            React.Children.map(childrenProp, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }

                const props: StrikethroughProps = {
                    style: StyleUtils.combineStyles(child.props.style, styles.offlineFeedback.deleted, styles.userSelectNone),
                };

                if (child.props.children) {
                    props.children = applyStrikeThrough(child.props.children);
                }

                return React.cloneElement(child, props);
            }),
        [StyleUtils, styles],
    );

    // Apply strikethrough to children if needed, but skip it if we are not going to render them
    if (needsStrikeThrough && !hideChildren) {
        children = applyStrikeThrough(children);
    }
    return (
        <View style={style}>
            {!hideChildren && (
                <View
                    style={[needsOpacity ? styles.offlineFeedback.pending : {}, contentContainerStyle]}
                    needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOpacity && needsOffscreenAlphaCompositing : undefined}
                >
                    {children}
                </View>
            )}
            {shouldShowErrorMessages && hasErrorMessages && (
                <MessagesRow
                    messages={errorMessages}
                    type="error"
                    onClose={onClose}
                    containerStyles={errorRowStyles}
                    canDismiss={canDismissError}
                />
            )}
        </View>
    );
}

OfflineWithFeedback.displayName = 'OfflineWithFeedback';

export default OfflineWithFeedback;
