import type {Meta} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Button from '@components/Button';
import {Confirm as ConfirmCallable, Decision as DecisionCallable, HoldMenu as HoldMenuCallable, HRSyncResults as HRSyncResultsCallable} from '@components/Dialog';
import type {HRSyncResultsCallProps} from '@components/Dialog/types';
import Text from '@components/Text';
import variables from '@styles/variables';
import CONST from '@src/CONST';

const story: Meta = {
    title: 'Components/Dialog',
};

export default story;

const containerStyle = {
    padding: variables.spacing2 * 2,
    gap: variables.spacing2,
} as const;

const labelStyle = {
    fontSize: variables.fontSizeNormal,
    marginTop: variables.spacing2,
} as const;

// Each story mounts only the Callable it exercises; Storybook renders one story at a time so the
// single-Root invariant holds. In docs-mode (multiple stories per page) this would need `react-call/host`.
const withCallable = (Callable: React.ComponentType, Inner: React.ComponentType) => () => (
    <SafeAreaProvider>
        <View style={containerStyle}>
            <Inner />
            <Callable />
        </View>
    </SafeAreaProvider>
);

function ConfirmStoryInner() {
    const [result, setResult] = useState<string>('—');
    const onPress = async () => {
        const outcome = await ConfirmCallable.call({
            title: 'Delete this transaction?',
            prompt: 'This cannot be undone.',
            submit: {text: 'Delete', variant: 'danger'},
            cancel: {text: 'Cancel'},
        });
        setResult(outcome.action);
    };

    return (
        <>
            <Button onPress={onPress}>Open Confirm</Button>
            <Text style={labelStyle}>Last result: {result}</Text>
        </>
    );
}

function DecisionStoryInner() {
    const [result, setResult] = useState<string>('—');

    const onPressDual = async () => {
        const outcome = await DecisionCallable.call({
            title: 'Approve or pay?',
            prompt: 'Choose how to settle this report.',
            firstOptionText: 'Approve',
            firstOptionVariant: 'primary',
            secondOptionText: 'Pay',
            secondOptionVariant: 'neutral',
        });
        setResult(outcome.action);
    };

    const onPressSole = async () => {
        const outcome = await DecisionCallable.call({
            title: 'Heads up',
            prompt: 'Acknowledge to continue.',
            secondOptionText: 'OK',
            secondOptionVariant: 'primary',
        });
        setResult(outcome.action);
    };

    return (
        <>
            <Button onPress={onPressDual}>Open Decision (two options)</Button>
            <Button onPress={onPressSole}>Open Decision (sole option)</Button>
            <Text style={labelStyle}>Last result: {result}</Text>
        </>
    );
}

function HoldMenuStoryInner() {
    const [result, setResult] = useState<string>('—');

    const onPressPay = async () => {
        const outcome = await HoldMenuCallable.call({
            reportID: 'stub-report',
            chatReportID: 'stub-chat',
            requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            nonHeldAmount: '$25.00',
            fullAmount: '$100.00',
        });
        setResult(outcome.action);
    };

    const onPressApprove = async () => {
        const outcome = await HoldMenuCallable.call({
            reportID: 'stub-report',
            chatReportID: 'stub-chat',
            requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            fullAmount: '$100.00',
            transactionCount: 1,
        });
        setResult(outcome.action);
    };

    return (
        <>
            <Button onPress={onPressPay}>Open HoldMenu (Pay — partial)</Button>
            <Button onPress={onPressApprove}>Open HoldMenu (Approve — sole)</Button>
            <Text style={labelStyle}>Last result: {result}</Text>
        </>
    );
}

const HR_STUB_RESULT: HRSyncResultsCallProps['result'] = {
    addedEmployeesCount: 12,
    removedEmployeesCount: 3,
    skippedEmployees: [
        {id: '1', name: 'Alex Chen', reason: 'Missing email address'},
        {id: '2', name: 'Sam Patel', reason: 'Already a workspace member'},
    ],
};

function HRSyncResultsStoryInner() {
    const [result, setResult] = useState<string>('—');

    const onPress = async () => {
        const outcome = await HRSyncResultsCallable.call({
            policyID: 'stub-policy',
            result: HR_STUB_RESULT,
        });
        setResult(outcome.action);
    };

    return (
        <>
            <Button onPress={onPress}>Open HRSyncResults</Button>
            <Text style={labelStyle}>Last result: {result}</Text>
        </>
    );
}

const Confirm = withCallable(ConfirmCallable, ConfirmStoryInner);
const Decision = withCallable(DecisionCallable, DecisionStoryInner);
const HoldMenu = withCallable(HoldMenuCallable, HoldMenuStoryInner);
const HRSyncResults = withCallable(HRSyncResultsCallable, HRSyncResultsStoryInner);

export {Confirm, Decision, HoldMenu, HRSyncResults};
