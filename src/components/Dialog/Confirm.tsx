import React from 'react';
import type {CallContext} from 'react-call';
import {useMutationFlow} from 'react-call/mutation-flow';
import * as Slots from '@components/Modal/v2/confirm';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import {DialogActions} from './actions';
import type {DialogResponse} from './actions';
import createDialogCallable from './createDialogCallable';
import type {ConfirmCallProps} from './types';

type ConfirmCtx = CallContext<ConfirmCallProps, DialogResponse, Record<string, never>>;

type ConfirmInnerProps = ConfirmCallProps & {call: ConfirmCtx};

function ConfirmInner({call, onConfirm, title, prompt, submit, cancel, icon, banner, onBackdropPress}: ConfirmInnerProps) {
    const activeElementRole = useActiveElementRole();
    const {translate} = useLocalize();

    const wrappedMutation = onConfirm
        ? async (mutationCall: {end: (response: DialogResponse) => void}, payload: void) => {
              try {
                  await onConfirm(mutationCall, payload);
              } catch (error) {
                  Log.alert('[Dialog/Confirm] onConfirm rejected', {error: String(error)});
                  mutationCall.end({action: DialogActions.ERROR});
              }
          }
        : undefined;

    const submitFlow = useMutationFlow<DialogResponse>(call, wrappedMutation);
    const onSubmitPress = () => {
        if (call.ended) {
            return;
        }
        submitFlow().orEnd({action: DialogActions.CONFIRM});
    };
    const onCancelPress = () => call.end({action: DialogActions.CLOSE});

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, onSubmitPress, {
        isActive: activeElementRole !== CONST.ROLE.BUTTON && !submitFlow.pending && !call.ended,
        shouldPreventDefault: false,
        shouldBubble: false,
    });

    return (
        <Slots.Root
            isOpen={!call.ended}
            onConfirm={onSubmitPress}
            onCancel={onCancelPress}
            onBackdropPress={onBackdropPress}
        >
            {!!banner && (
                <Slots.Banner
                    src={banner.src}
                    fit={banner.fit}
                />
            )}
            {!!icon && (
                <Slots.Icon
                    src={icon.src}
                    fill={icon.fill}
                />
            )}
            {!!title && <Slots.Title>{title}</Slots.Title>}
            {!!prompt && <Slots.Description>{prompt}</Slots.Description>}
            <Slots.Actions>
                <Slots.Action
                    slot="confirm"
                    text={submit?.text ?? translate('common.yes')}
                    variant={submit?.variant ?? 'primary'}
                    isLoading={submitFlow.pending}
                />
                {!!cancel && (
                    <Slots.Action
                        slot="cancel"
                        text={cancel.text ?? translate('common.no')}
                    />
                )}
            </Slots.Actions>
        </Slots.Root>
    );
}

const Confirm = createDialogCallable<ConfirmCallProps>('Confirm', ConfirmInner);

export default Confirm;
