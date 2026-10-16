import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import React, {Activity, useEffect} from 'react';

import type {ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, leaf, Leaf, LiveScreen, resetLog, runOn, Subject, visible} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * A screen can render an <Activity> of its own, as a tab bar or a picker does, and the hook cannot tell that hide from
 * the cover of the screen: both are a passive cleanup with nothing owed. These tests pin down what that means on a
 * screen of either behavior.
 */

/** A part of the screen behind an <Activity> of the screen itself, which the isHidden of the step drives. */
function Tab({isHidden, children}: ScreenProps) {
    return <Activity mode={isHidden ? 'hidden' : 'visible'}>{children}</Activity>;
}

const siblings = (
    <>
        <Subject
            name="a"
            value="1"
        />
        <Subject
            name="b"
            value="1"
        />
    </>
);

/** The tab hiding and showing again while the screen itself stays visible and never renders its root again. */
const hideAndShowTab = [visible(<Leaf>{<Tab isHidden={false}>{siblings}</Tab>}</Leaf>), leaf(<Tab isHidden>{siblings}</Tab>), leaf(<Tab isHidden={false}>{siblings}</Tab>)];

describe('useScreenActivityEffect behind an <Activity> inside the screen', () => {
    beforeEach(() => {
        resetLog();
    });

    it('keeps every setup through the hide and show of the tab on a screen that stays live as well', async () => {
        // Given two call sites behind a tab on a screen that did not opt into <Activity>
        // When the tab hides and shows again
        const live = await runOn(useEffect, LiveScreen, hideAndShowTab);
        const activity = await runOn(useScreenActivityEffect, LiveScreen, hideAndShowTab);

        // Then the hook keeps the setups here too, because it answers to no screen: a setup survives every hide until
        // the dependencies change or the component goes away, wherever the <Activity> that hid it sits
        expect(live).toEqual([
            ['setup:a:1', 'setup:b:1'],
            ['cleanup:a:1', 'cleanup:b:1'],
            ['setup:a:1', 'setup:b:1'],
            ['cleanup:a:1', 'cleanup:b:1'],
        ]);
        expect(activity).toEqual([['setup:a:1', 'setup:b:1'], [], [], ['cleanup:a:1', 'cleanup:b:1']]);
    });

    it('releases a call site removed behind the hidden tab right after that commit, and the rest on the pop', async () => {
        // Given a call site removed while the tab hides it, next to a part of the screen outside the tab
        const outside = (value: string) => (
            <Subject
                name="outside"
                value={value}
            />
        );
        const steps = [
            visible(
                <Leaf>
                    <Tab isHidden={false}>{siblings}</Tab>
                    {outside('1')}
                </Leaf>,
            ),
            leaf(
                <>
                    <Tab isHidden>{siblings}</Tab>
                    {outside('1')}
                </>,
            ),
            leaf(
                <>
                    <Tab isHidden>
                        <Subject
                            name="a"
                            value="1"
                        />
                    </Tab>
                    {outside('1')}
                </>,
            ),
            leaf(
                <>
                    <Tab isHidden>
                        <Subject
                            name="a"
                            value="1"
                        />
                    </Tab>
                    {outside('2')}
                </>,
            ),
        ];

        // When a dependency of the part outside the tab changes afterwards and the screen finally leaves the stack
        const activity = await runOn(useScreenActivityEffect, ActivityScreen, steps);

        // Then the removal is released in its own commit, the change outside the tab is an ordinary swap, and the pop
        // releases the part outside the tab from its passive cleanup and the one still hidden behind the tab after the
        // commit, because a hidden component has no passive cleanup for React to run
        expect(activity).toEqual([['setup:a:1', 'setup:b:1', 'setup:outside:1'], [], ['cleanup:b:1'], ['cleanup:outside:1', 'setup:outside:2'], ['cleanup:outside:2', 'cleanup:a:1']]);
    });
});
