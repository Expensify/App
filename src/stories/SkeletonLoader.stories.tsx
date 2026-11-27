import AvatarSkeleton from '@components/AvatarSkeleton';
import SkeletonLoader, {SkeletonViewRect} from '@components/SkeletonLoader';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

const ROW_COUNT = 10;
const ROW_HEIGHT = 64;
const ROW_WIDTH = 360;
const SPEED_SECONDS = 1.2;

type ComparisonProps = {candidate: 'legacy' | 'pulse' | 'static'};

function LegacyRow() {
    return (
        <>
            <SkeletonRect
                width={40}
                height={40}
                borderRadius={20}
                transform={[{translateX: 8}, {translateY: 12}]}
            />
            <SkeletonRect
                width={200}
                height={8}
                transform={[{translateX: 64}, {translateY: 12}]}
            />
            <SkeletonRect
                width={280}
                height={8}
                transform={[{translateX: 64}, {translateY: 28}]}
            />
            <SkeletonRect
                width={160}
                height={8}
                transform={[{translateX: 64}, {translateY: 44}]}
            />
        </>
    );
}

function ViewRow() {
    return (
        <>
            <SkeletonViewRect
                width={40}
                height={40}
                borderRadius={20}
                x={8}
                y={12}
            />
            <SkeletonViewRect
                width={200}
                height={8}
                x={64}
                y={12}
            />
            <SkeletonViewRect
                width={280}
                height={8}
                x={64}
                y={28}
            />
            <SkeletonViewRect
                width={160}
                height={8}
                x={64}
                y={44}
            />
        </>
    );
}

function Comparison({candidate}: ComparisonProps) {
    const theme = useTheme();
    return (
        <View style={{width: ROW_WIDTH, height: ROW_COUNT * ROW_HEIGHT}}>
            {Array.from({length: ROW_COUNT}, (_, index) =>
                candidate === 'legacy' ? (
                    <SkeletonViewContentLoader
                        key={index}
                        width={ROW_WIDTH}
                        height={ROW_HEIGHT}
                        speed={SPEED_SECONDS}
                        backgroundColor={theme.skeletonLHNIn}
                        foregroundColor={theme.skeletonLHNOut}
                    >
                        <LegacyRow />
                    </SkeletonViewContentLoader>
                ) : (
                    <SkeletonLoader
                        key={index}
                        width={ROW_WIDTH}
                        height={ROW_HEIGHT}
                        speed={SPEED_SECONDS}
                        animate={candidate !== 'static'}
                        backgroundColor={theme.skeletonLHNIn}
                        foregroundColor={theme.skeletonLHNOut}
                    >
                        <ViewRow />
                    </SkeletonLoader>
                ),
            )}
        </View>
    );
}

function Geometry() {
    const theme = useTheme();
    return (
        <View style={{width: ROW_WIDTH}}>
            <AvatarSkeleton />
            <SkeletonLoader
                width="100%"
                height={ROW_HEIGHT}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonViewRect
                    x={8}
                    y={8}
                    width={40}
                    height={40}
                    borderRadius={20}
                />
                <SkeletonViewRect
                    x={64}
                    y={12}
                    width="100%"
                    height="8"
                />
                <SkeletonViewRect
                    x={64}
                    y={32.5}
                    width="50%"
                    height="8"
                />
            </SkeletonLoader>
        </View>
    );
}

const meta: Meta<typeof Comparison> = {
    title: 'Components/SkeletonLoader',
    component: Comparison,
    argTypes: {candidate: {control: 'select', options: ['legacy', 'pulse', 'static']}},
    parameters: {
        docs: {
            description: {
                component:
                    'Each list has 10 loaders and 40 shapes. Legacy: 10 gradient loops; pulse: 10 opacity loops and 80 static shapes; static: no loops. Pulse was selected by review, not measured profiling. Animation counts are not CPU/frame-time measurements.',
            },
        },
    },
};

function Legacy(args: ComparisonProps) {
    return <Comparison {...args} />;
}
Legacy.args = {candidate: 'legacy'};
function Pulse(args: ComparisonProps) {
    return <Comparison {...args} />;
}
Pulse.args = {candidate: 'pulse'};
function Static(args: ComparisonProps) {
    return <Comparison {...args} />;
}
Static.args = {candidate: 'static'};

export default meta;
export {Legacy, Pulse, Static, Geometry};
