import {format} from 'date-fns';

// Converts milliseconds to 'minutes:seconds' format
const convertMillisecondsToTime = (milliseconds: number) => {
    const date = new Date(milliseconds);
    return format(date, 'mm:ss');
};

export default convertMillisecondsToTime;
