type SimulateMarqeta3DSChallengeParams = {
    merchant?: string;
    amount?: number;
    currency?: string;
    deliverAfterSeconds?: number;
    shouldRunAllFlows?: boolean;
    cardID?: number;
    simulatedOutcome?: string;
    maxResponseTime?: number;
};

export default SimulateMarqeta3DSChallengeParams;
