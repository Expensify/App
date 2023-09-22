function throttle(func: (...args: unknown[]) => void, timeFrame: number): (...args: unknown[]) => void {
    let lastTime = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastTime >= timeFrame) {
            func(...args);
            lastTime = now;
        }
    };
}

export default throttle;
