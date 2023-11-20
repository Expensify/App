import {format} from 'date-fns';

// Converts milliseconds to 'minutes:seconds' format
const convertMillisecondsToTime = (milliseconds) => {
    const date = new Date(milliseconds);
    const time = format(date, 'mm:ss');
    return time;
};

export default convertMillisecondsToTime;
