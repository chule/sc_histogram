"use client";
import { useEffect, useRef } from "react";
import {
  SciChartSurface,
  NumericAxis,
  SciChartJsNavyTheme,
  FastRectangleRenderableSeries,
  EColumnMode,
  EColumnYMode,
  EDataPointWidthMode,
  EResamplingMode,
  XyxyDataSeries,
  EColumnDataLabelPosition,
  EHorizontalTextPosition,
  EVerticalTextPosition,
  Thickness,
  EAxisAlignment,
  ETextAlignment,
  ETitlePosition,
  ENumericFormat,
} from "scichart";

type MetadataType = {
  label: string;
  isSelected: boolean;
};

// An example of WASM dependencies URLs configuration to fetch from origin server:
SciChartSurface.configure({
  wasmUrl: "scichart2d.wasm",
  dataUrl: "scichart2d.data",
});

async function initSciChart(rootElement: string | HTMLDivElement) {
  // Initialize SciChartSurface. Don't forget to await!
  const { sciChartSurface, wasmContext } = await SciChartSurface.create(
    rootElement,
    {
      theme: new SciChartJsNavyTheme(),
    }
  );

  // Create an XAxis and YAxis with growBy padding
  // const growBy = new NumberRange(0.1, 0.1);
  sciChartSurface.xAxes.add(
    new NumericAxis(wasmContext, {
      labelFormat: ENumericFormat.NoFormat,
      axisTitle: "Age Range (Years)",
      axisTitleStyle: {
        fontSize: 14,
        fontFamily: "Arial",
        color: "#ffffff",
        // fontWeight: "bold",
        fontStyle: "italic",
      },
    })
  );
  sciChartSurface.yAxes.add(
    new NumericAxis(wasmContext, {
      labelFormat: ENumericFormat.SignificantFigures,
      axisTitle: "Population (Bilions)",
      axisAlignment: EAxisAlignment.Left,
      isVisible: true,
      axisTitleStyle: {
        fontSize: 14,
        fontFamily: "Arial",
        color: "#ffffff",
        // fontWeight: "bold",
        fontStyle: "italic",
      },
    })
  );

  const topMargin = 30;
  const rightMargin = 20;
  const bottomMargin = 10;
  const leftMargin = 20;

  sciChartSurface.padding = new Thickness(
    topMargin,
    rightMargin,
    bottomMargin,
    leftMargin
  );

  const data = [
    { x: 0, y: 0, x1: 10, y1: 1.2 },
    { x: 10, y: 0, x1: 20, y1: 1.1 },
    { x: 20, y: 0, x1: 30, y1: 1.0 },
    { x: 30, y: 0, x1: 40, y1: 1.0 },
    { x: 40, y: 0, x1: 50, y1: 0.9 },
    { x: 50, y: 0, x1: 60, y1: 0.8 },
    { x: 60, y: 0, x1: 70, y1: 0.7 },
    { x: 70, y: 0, x1: 80, y1: 0.5 },
    { x: 80, y: 0, x1: 90, y1: 0.3 },
    { x: 90, y: 0, x1: 100, y1: 0.1 },
  ];

  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);
  const x1Values = data.map((d) => d.x1);
  const y1Values = data.map((d) => d.y1);

  const metadata = data.map((d) => ({
    label: d.y1.toString(),
    isSelected: false,
  }));

  console.log({ metadata });

  //FastRectangleRenderableSeries
  const rectangleSeries = new FastRectangleRenderableSeries(wasmContext, {
    dataSeries: new XyxyDataSeries(wasmContext, {
      xValues,
      yValues,
      x1Values,
      y1Values,
      metadata,
    }),
    columnXMode: EColumnMode.StartEnd,
    columnYMode: EColumnYMode.TopBottom,
    dataPointWidth: 1,
    dataPointWidthMode: EDataPointWidthMode.Range,
    stroke: "black",
    strokeThickness: 2,
    fill: "steelblue",
    opacity: 0.5,
    // defaultY1: 0,
    resamplingMode: EResamplingMode.None,
    topCornerRadius: 2,
    bottomCornerRadius: 2,
    dataLabels: {
      horizontalTextPosition: EHorizontalTextPosition.Right,
      verticalTextPosition: EVerticalTextPosition.Above,
      positionMode: EColumnDataLabelPosition.Outside,
      style: {
        fontSize: 16,
        padding: new Thickness(0, 0, 8, 32),
      },
      color: "#EEE",
      metaDataSelector: (md) => {
        const metadata = md as MetadataType;
        return metadata.label;
      },
    },
    // this does not work
    // animation: new WaveAnimation({ duration: 1000 })
  });

  sciChartSurface.renderableSeries.add(rectangleSeries);

  sciChartSurface.title = ["World Population Distribution by Age Range (2025)"];

  sciChartSurface.titleStyle = {
    color: "#ffffff",
    fontSize: 24,
    alignment: ETextAlignment.Center,
    position: ETitlePosition.Top,
    placeWithinChart: false,
    padding: Thickness.fromString("40 0 0 0"),
  };

  return { sciChartSurface };
}

export default function Home() {
  const rootElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPromise = initSciChart(rootElementRef.current as HTMLDivElement);

    return () => {
      initPromise.then(({ sciChartSurface }) => sciChartSurface.delete());
    };
  }, []);

  return <div ref={rootElementRef} style={{ width: 900, height: 600 }}></div>;
}
