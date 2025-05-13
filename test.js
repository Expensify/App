function add(a, b) {
    return a + b;
}

const multiply = (a, b) => {
    return a * b;
};

// eslint-disable-next-line @lwc/lwc/no-async-await
async function delayAdd(a, b) {
    await new Promise((res) => setTimeout(res, 100));
    return a + b;
}

add(1, 2);
multiply(2, 3);
delayAdd(3, 4).then(console.log);
