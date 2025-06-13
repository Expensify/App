type GraphiteParams = {
    type: 'timer' | 'counter';
    statName: string;
    value: number;
};

export default GraphiteParams;
