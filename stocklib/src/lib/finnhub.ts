import axios from 'axios';
import { ErrorResponse } from './stocklib';

export interface SearchResponse {
    "count": number,
    "result":
    {
        "description": string,
        "displaySymbol": string,
        "symbol": string,
        "type": string
    }[]
}

export interface QuoteResponse {
    "c": number,
    "h": number,
    "l": number,
    "o": number,
    "pc": number,
    "t": number,
}

export async function getResponse<T>(path: string, params: any): Promise<T> {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/${path}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Finnhub-Token': process.env.FINNHUB_API_KEY || "ciqlqj9r01qjff7cr300ciqlqj9r01qjff7cr30g"
            },
            params
        });
        if (typeof response.data.error === "string")
            throw new ErrorResponse({
                code: 500,
                message: response.data.error
            })

        return response.data as T;
    } catch (error) {
        console.log(JSON.stringify(error))
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new ErrorResponse({
                code: error.response.status,
                message: `server responded with error: ${JSON.stringify(error.response)}`
            })
        } else if (error.request) {
            // The request was made but no response was received
            throw new ErrorResponse({
                code: 500,
                message: `server didn't respond. request made: ${JSON.stringify(error.request)}`
            })
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new ErrorResponse({
                code: 500,
                message: `something happened in setting up the request that triggered an Error:  ${JSON.stringify(error.message)}`
            })
        }
    }

}