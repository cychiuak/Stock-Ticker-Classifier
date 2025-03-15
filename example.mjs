import OpenAI from "openai";
const client = new OpenAI();

const input = `Given a natural language input, extract the following information:
Stock Ticker(s): Identify the relevant stock ticker(s) of the company given in the input. If no ticker is explicitly mentioned or implied, return "No tickers found."
input: The trend of Alibaba HK`;
const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "user",
            content: input,
        },
    ],
});

console.log(completion.choices[0].message.content);