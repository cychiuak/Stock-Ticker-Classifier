// /pages/api/search-symbol.ts

// import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import https from 'https';
import axios from 'axios';

export async function POST(request:Request) {
    try {
      // console.log("testing123");
      // console.log("request is", request);
    
    // console.log(completion.choices[0].message.content);
    const text = await request.json();
    const result:any[] = []
    for (const item of text) {
      console.log("Processing item:", item);

      // Construct Axios options for each query
      const options = {
        baseURL: 'https://financialmodelingprep.com',
        port: 443,
        url: `/stable/search-symbol?query=${encodeURIComponent(
          item
        )}&apikey=${process.env.FMP_API_KEY}`,
        method: 'GET'
      };

      // Make the API request
      const response = await axios(options);
      console.log("Response for item:", item, response.data[0]);

      // Push the result into the array
      if (response.data && response.data[0]) {
        result.push(response.data[0]);
      }
    }

    console.log("Final result:", result);
    return new NextResponse(
      JSON.stringify({
        message: result,
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
  // const { stockTicker, apikey } = req.query;
  // console.log("stockTicker is ",stockTicker);
  // // Ensure the query parameter is provided
  // if (!stockTicker || typeof stockTicker !== 'string') {
  //   res.status(400).json({ error: 'Missing or invalid query parameter' });
  //   return;
  // }

  // const options = {
  //   hostname: 'financialmodelingprep.com',
  //   port: 443,
  //   path: `/stable/search-symbol?query=${encodeURIComponent(stockTicker)}&apikey=${process.env.FMP_API_KEY}`,
  //   method: 'GET',
  // };

  // const request = https.request(options, (response) => {
  //   let data = '';

  //   // Collect data chunks
  //   response.on('data', (chunk) => {
  //     data += chunk;
  //   });

  //   // Send the complete data back to the client
  //   response.on('end', () => {
  //     try {
  //       const parsedData = JSON.parse(data);
  //       res.status(200).json(parsedData);
  //     } catch (error) {
  //       res.status(500).json({ error: 'Failed to parse response data' });
  //     }
  //   });
  // });

  // // Handle request errors
  // request.on('error', (error) => {
  //   console.error(error);
  //   res.status(500).json({ error: 'Request failed' });
  // });

  // // End the request
  // request.end();
}