'use client'
import {
    Autocomplete,
    AutocompleteItem
} from "@nextui-org/autocomplete";
import { Query } from "../api/axios-client";
import { useState } from "react";
import dynamic from "next/dynamic";

const CanvasJSChart = dynamic(() => import("@canvasjs/react-charts").then((mod) => {
    const chart = mod.default.CanvasJSChart
    return chart
}), { ssr: false }) as any;

export default function Content() {
    const [symbol, setSymbol] = useState<string>("")
    const [searchString, setSearchString] = useState("AAPL")
    const searchQuery = Query.useSearchQuery(searchString)
    const stockQuery = Query.useStockGETQuery(symbol)
    const chartQuery = Query.useChartQuery(symbol)
    return (
        <div>
            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                <Autocomplete
                    label="Select a symbol to display data"
                    className="max-w-xs"
                    variant='bordered'
                    onInputChange={(value) => {
                        setSearchString(value)
                    }}
                    selectedKey={symbol}
                    onSelectionChange={(key) => {
                        if (typeof key === "string")
                            setSymbol(key)
                    }}
                    disabled={searchQuery.isFetching}
                >
                    {searchQuery.isFetching ? [] : (searchQuery.data || []).map(({ symbol }) => (
                        <AutocompleteItem key={symbol!} value={symbol!}>
                            {symbol!}
                        </AutocompleteItem>
                    ))}
                </Autocomplete>
            </div>
            <CanvasJSChart
                options={
                    {
                        theme: 'dark1',
                        animationEnabled: true,
                        title: {
                            text: symbol
                        },
                        data: [
                            {
                                type: 'line',
                                name: "Ema",
                                showInLegend: true,
                                dataPoints: chartQuery.data?.map(row => {
                                    return {
                                        label: row.createdAt,
                                        y: row.ema
                                    }
                                }) || []
                            },
                            {
                                type: 'line',
                                name: "Price",
                                showInLegend: true,
                                dataPoints: chartQuery.data?.map(row => {
                                    return {
                                        label: row.createdAt,
                                        y: row.price
                                    }
                                }) || []
                            }, {
                                type: 'line',
                                name: "Sma",
                                showInLegend: true,
                                dataPoints: chartQuery.data?.map(row => {
                                    return {
                                        label: row.createdAt,
                                        y: row.sma
                                    }
                                }) || []
                            }

                        ]
                    }
                }
                containerProps={{
                    width: '80%',
                    height: '360px',
                    margin: 'auto'
                }}
            />

            <div>
                {stockQuery.data ?
                    <div>
                        <h1>{stockQuery.data.name}</h1>
                        <h1>Ema: {stockQuery.data.ema} {stockQuery.data.currency}</h1>
                        <h1>Sma: {stockQuery.data.sma} {stockQuery.data.currency}</h1>
                        <h1>Price: {stockQuery.data.current} {stockQuery.data.currency}</h1>
                    </div>
                    :
                    <h2>Nothing to show here</h2>
                }
            </div>
        </div>
    );
}
