import {render} from '@testing-library/react-native';

import React from 'react';
import {View} from 'react-native';

type Card = {cardID: number; cardTitle: string};

function CardRow({captureInstance, cardID, cardTitle}: {captureInstance: (id: number, instance: unknown) => void; cardID: number; cardTitle: string}) {
    return (
        <View
            ref={(node) => captureInstance(cardID, node)}
            accessibilityLabel={cardTitle}
        />
    );
}

function CardList({cards, keyFn, captureInstance}: {cards: Card[]; keyFn: (c: Card) => string | number; captureInstance: (id: number, instance: unknown) => void}) {
    return (
        <View>
            {cards.map((c) => (
                <CardRow
                    key={keyFn(c)}
                    captureInstance={captureInstance}
                    cardID={c.cardID}
                    cardTitle={c.cardTitle}
                />
            ))}
        </View>
    );
}

describe('Stable React-key contract for focus-return rows', () => {
    it('preserves the row ref identity across a value change when the key is a stable identifier', () => {
        const refs = new Map<number, unknown>();
        const capture = (id: number, instance: unknown) => {
            if (instance === null) {
                return;
            }
            refs.set(id, instance);
        };
        const {rerender} = render(
            <CardList
                cards={[{cardID: 1, cardTitle: 'Old name'}]}
                keyFn={(c) => c.cardID}
                captureInstance={capture}
            />,
        );
        const before = refs.get(1);

        rerender(
            <CardList
                cards={[{cardID: 1, cardTitle: 'New name'}]}
                keyFn={(c) => c.cardID}
                captureInstance={capture}
            />,
        );
        const after = refs.get(1);

        expect(before).toBeTruthy();
        expect(after).toBe(before);
    });

    it('remounts the row across a value change when the key embeds the value (the failure mode the contract prevents)', () => {
        const seenInstances: unknown[] = [];
        const capture = (_id: number, instance: unknown) => {
            if (instance === null) {
                return;
            }
            seenInstances.push(instance);
        };
        const {rerender} = render(
            <CardList
                cards={[{cardID: 1, cardTitle: 'Old name'}]}
                keyFn={(c) => `${c.cardTitle}_${c.cardID}`}
                captureInstance={capture}
            />,
        );
        const initialCount = seenInstances.length;
        expect(initialCount).toBeGreaterThanOrEqual(1);

        rerender(
            <CardList
                cards={[{cardID: 1, cardTitle: 'New name'}]}
                keyFn={(c) => `${c.cardTitle}_${c.cardID}`}
                captureInstance={capture}
            />,
        );
        expect(seenInstances.length).toBeGreaterThan(initialCount);
        const lastInstance = seenInstances.at(-1);
        const firstInstance = seenInstances.at(0);
        expect(lastInstance).not.toBe(firstInstance);
    });
});
