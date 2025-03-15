import { NextResponse } from 'next/server';
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
interface GenerateRequest {
  prompt: string;
}

export async function POST(request: Request) {
  // const body: GenerateRequest = await request.json();

  // if (!body.prompt) {
  //   return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  // }
  try {
    // console.log("testing123");
    // console.log("request is", request);
    const text = await request.json();
    // console.log("text is", text);
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          {
              role: "user",
              content: text,
          },
      ],
  });
  
  // console.log(completion.choices[0].message.content);
    return new NextResponse(
      JSON.stringify({
        message: completion.choices[0].message.content,
      })
    );
    //   return new NextResponse(
    //   JSON.stringify({
    //     message: request,
    //   })
    // );

  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: error,
      })
    );
    // console.error(error);
    // return new NextResponse(
    //   JSON.stringify({
    //     message: error,
    //   })
    // );
  }
}
