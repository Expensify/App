import deepEqual from 'lodash/isEqual';
import React, {memo} from 'react';
import {FlatList, View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type TrapItem = {
    id: string;
    isActive: boolean;
    label: string;
};

function expensiveValidation(item: TrapItem): boolean {
    return /trap/i.test(`${item.label}-${item.id}`);
}

type TrapRowProps = {
    details: TrapItem;
    accent: {tone: string; emphasis: number};
    onSelect: (id: string) => void;
};

function TrapRow({details, accent, onSelect}: TrapRowProps) {
    return (
        <PressableWithFeedback onPress={() => onSelect(details.id)}>
            <Text>{details.label}</Text>
            <Text>{accent.tone}</Text>
            <Text>{accent.emphasis}</Text>
        </PressableWithFeedback>
    );
}

const MemoizedTrapRow = memo(TrapRow, (prevProps, nextProps) => deepEqual(prevProps.details, nextProps.details) && prevProps.accent.tone === nextProps.accent.tone);

type RenderItemRowProps = {
    item: TrapItem;
    accent: {tone: string; emphasis: number};
};

function RenderItemRow({item, accent}: RenderItemRowProps) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    return (
        <MemoizedTrapRow
            details={item}
            accent={accent}
            onSelect={(id) => {
                console.log(personalDetails?.[id]);
            }}
        />
    );
}

type ActionSummaryProps = {
    payload: {total: number; allActive: boolean};
    onRefresh: () => void;
};

function ActionSummary({payload, onRefresh}: ActionSummaryProps) {
    return (
        <View>
            <Text>{payload.total}</Text>
            <PressableWithFeedback onPress={onRefresh}>
                <Text>Refresh</Text>
            </PressableWithFeedback>
        </View>
    );
}

function ReviewerTrapList() {
    const data: TrapItem[] = [
        {id: '1', isActive: true, label: 'One'},
        {id: '2', isActive: false, label: 'Two'},
    ];

    const allActive = data.every((candidate) => expensiveValidation(candidate) && candidate.isActive);

    return (
        <View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <RenderItemRow
                        item={{
                            ...item,
                            label: `${item.label} spread`,
                        }}
                        accent={{
                            tone: item.isActive ? 'emerald' : 'ash',
                            emphasis: Math.random(),
                        }}
                    />
                )}
            />
            <ActionSummary
                payload={{total: data.length, allActive}}
                onRefresh={() => expensiveValidation(data.at(0))}
            />
            <Text>{allActive ? 'All active' : 'Not all active'}</Text>
        </View>
    );
}

export default ReviewerTrapList;
