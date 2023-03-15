// eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export, @lwc/lwc/no-async-await
export async function summarize(largeMessage) {
    const x = await fetch('https://api.openai.com/v1/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_TOKEN}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: largeMessage,
        }),
        method: 'POST',
    });
    const json = await x.json();
    const reply = json.choices?.[0]?.text ?? 'hm.';
    return reply;
}
