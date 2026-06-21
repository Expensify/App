import React from 'react';
import type {CallContext} from 'react-call';
import {View} from 'react-native';
import {useRegisteredDescription} from '@components/Modal/v2/compound/Heading';
import * as Slots from '@components/Modal/v2/decision';
import RenderHTML from '@components/RenderHTML';
import {DialogActions} from './actions';
import type {DialogResponse} from './actions';
import createDialogCallable from './createDialogCallable';
import type {DecisionCallProps} from './types';

type DecisionCtx = CallContext<DecisionCallProps, DialogResponse, Record<string, never>>;

type DecisionInnerProps = DecisionCallProps & {call: DecisionCtx};

function DecisionInner(props: DecisionInnerProps) {
    const {call, title, prompt, secondOptionText, secondOptionVariant} = props;
    const confirm = () => call.end({action: DialogActions.CONFIRM});
    const cancel = () => call.end({action: DialogActions.CLOSE});
    const onOpenChange = (open: boolean) => {
        if (open) {
            return;
        }
        cancel();
    };
    const hasFirstOption = 'firstOptionText' in props && props.firstOptionText !== undefined;

    return (
        <Slots.Root
            isOpen={!call.ended}
            onOpenChange={onOpenChange}
        >
            <Slots.Title>{title}</Slots.Title>
            {!!prompt && <DecisionPrompt html={prompt} />}
            {hasFirstOption ? (
                <>
                    <Slots.Option
                        position="primary"
                        text={props.firstOptionText}
                        onPress={confirm}
                        variant={props.firstOptionVariant}
                    />
                    <Slots.Option
                        position="secondary"
                        text={secondOptionText}
                        onPress={cancel}
                        variant={secondOptionVariant}
                    />
                </>
            ) : (
                <Slots.Option
                    position="sole"
                    text={secondOptionText}
                    onPress={cancel}
                    variant={secondOptionVariant}
                />
            )}
        </Slots.Root>
    );
}

function DecisionPrompt({html}: {html: string}) {
    const descriptionId = useRegisteredDescription();
    return (
        <View nativeID={descriptionId}>
            <RenderHTML html={html} />
        </View>
    );
}

const Decision = createDialogCallable<DecisionCallProps>('Decision', DecisionInner);

export default Decision;
