import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useConfirm} from './context';

type ActionVariant = 'primary' | 'success' | 'danger';

type ActionSlot =
    | {
          slot: 'confirm';
          text: string;
          variant: ActionVariant;
          onPress?: () => void;
          isDisabled?: boolean;
          isLoading?: boolean;
      }
    | {
          slot: 'cancel';
          text: string;
          variant?: undefined;
          onPress?: () => void;
          isDisabled?: undefined;
          isLoading?: undefined;
      }
    | {
          slot: 'dismiss';
          text?: undefined;
          variant?: undefined;
          onPress?: () => void;
          isDisabled?: undefined;
          isLoading?: undefined;
      };

function Action(props: ActionSlot) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {state, actions} = useConfirm('<Confirm.Action>');
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    if (props.slot === 'dismiss') {
        return (
            <View style={styles.alignItemsEnd}>
                <Tooltip text={translate('common.close')}>
                    <PressableWithoutFeedback
                        onPress={props.onPress ?? actions.cancel}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                        sentryLabel={CONST.SENTRY_LABEL.CONFIRM_CONTENT.DISMISS_BUTTON}
                    >
                        <Icon
                            fill={theme.icon}
                            src={icons.Close}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>
        );
    }

    if (props.slot === 'cancel') {
        return (
            <Button
                style={[styles.mt3, styles.noSelect]}
                onPress={props.onPress ?? actions.cancel}
                large
                text={props.text}
            />
        );
    }

    const isPrimaryOrSuccess = props.variant === 'success' || props.variant === 'primary';
    return (
        <Button
            success={isPrimaryOrSuccess}
            danger={props.variant === 'danger'}
            style={styles.mt3}
            onPress={props.onPress ?? actions.confirm}
            pressOnEnter
            isPressOnEnterActive={state.isOpen}
            large
            text={props.text}
            accessibilityLabel={props.text}
            isDisabled={props.isDisabled}
            isLoading={props.isLoading}
        />
    );
}

export default Action;
export type {ActionSlot, ActionVariant};
