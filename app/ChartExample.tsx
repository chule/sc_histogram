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
  // EResamplingMode,
  XyxyDataSeries,
  // EColumnDataLabelPosition,
  // EHorizontalTextPosition,
  // EVerticalTextPosition,
  Thickness,
  EAxisAlignment,
  ETextAlignment,
  ETitlePosition,
  ENumericFormat,
  LabelProviderBase2D,
  ICustomTextureOptions,
} from "scichart";

// type MetadataType = {
//   label: string;
//   isSelected: boolean;
// };

// An example of WASM dependencies URLs configuration to fetch from origin server:
SciChartSurface.configure({
  wasmUrl: "scichart2d.wasm",
  // dataUrl: "scichart2d.data",
});

async function initSciChart(rootElement: string | HTMLDivElement) {
  // Initialize SciChartSurface. Don't forget to await!
  const { sciChartSurface, wasmContext } = await SciChartSurface.create(
    rootElement,
    {
      theme: new SciChartJsNavyTheme(),
    }
  );

  class CustomLabelProvider extends LabelProviderBase2D {
    type!: string;
    onBeginAxisDraw(): void {}

    get formatLabel() {
      return (dataValue: number) => {
        if (dataValue === 5) return "";
        if (dataValue > 30 && dataValue < 45) return "";
        if (dataValue > 80 && dataValue < 105) return "";
        if (dataValue === 105) return "80+";
        return dataValue.toFixed(0);
      };
    }
  }

  sciChartSurface.xAxes.add(
    new NumericAxis(wasmContext, {
      labelProvider: new CustomLabelProvider(),
      autoTicks: false,
      majorDelta: 5,
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
      labelFormat: ENumericFormat.Engineering,
      axisTitle: "Population (Milions)",
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

  // const data = [
  //   { x: 0, y: 0, x1: 10, y1: 1.2 },
  //   { x: 10, y: 0, x1: 20, y1: 1.1 },
  //   { x: 20, y: 0, x1: 30, y1: 1.0 },
  //   { x: 30, y: 0, x1: 40, y1: 1.0 },
  //   { x: 40, y: 0, x1: 50, y1: 0.9 },
  //   { x: 50, y: 0, x1: 60, y1: 0.8 },
  //   { x: 60, y: 0, x1: 70, y1: 0.7 },
  //   { x: 70, y: 0, x1: 80, y1: 0.5 },
  //   { x: 80, y: 0, x1: 90, y1: 0.3 },
  //   { x: 90, y: 0, x1: 100, y1: 0.1 },
  // ];

  // Population Pyramid Data
  const populationData = {
    xValue: [
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100,
    ],
    yValue: {
      africa: {
        male: [
          35754890, 31813896, 28672207, 24967595, 20935790, 17178324, 14422055,
          12271907, 10608417, 8608183, 6579937, 5035598, 3832420, 2738448,
          1769284, 1013988, 470834, 144795, 26494, 2652, 140,
        ],
        female: [
          34834623, 31000760, 27861135, 24206021, 20338468, 16815440, 14207659,
          12167437, 10585531, 8658614, 6721555, 5291815, 4176910, 3076943,
          2039952, 1199203, 591092, 203922, 45501, 5961, 425,
        ],
      },
      europe: {
        male: [
          4869936, 5186991, 5275063, 5286053, 5449038, 5752398, 6168124,
          6375035, 6265554, 5900833, 6465830, 7108184, 6769524, 5676968,
          4828153, 3734266, 2732054, 1633630, 587324, 128003, 12023,
        ],
        female: [
          4641147, 4940521, 5010242, 5010526, 5160160, 5501673, 6022599,
          6329356, 6299693, 5930345, 6509757, 7178487, 7011569, 6157651,
          5547296, 4519433, 3704145, 2671974, 1276597, 399148, 60035,
        ],
      },
    },
  };

  const totalData = populationData.yValue.africa.male.map((d, i) => {
    const yValue =
      d +
      populationData.yValue.africa.female[i] +
      populationData.yValue.europe.male[i] +
      populationData.yValue.europe.female[i];

    return {
      yValue,
      xValue: populationData.xValue[i],
    };
  });

  // console.log({ totalData });

  const eightyPlus = totalData.reduce((acc, cur) => {
    return cur.xValue >= 80 ? cur.yValue + acc : acc;
  }, 0) as number;

  const aboveThirtyAndLessThanfourtyFive = totalData.reduce((acc, cur) => {
    return cur.xValue >= 30 && cur.xValue < 45 ? cur.yValue + acc : acc;
  }, 0) as number;

  const zeroToTen = totalData.reduce((acc, cur) => {
    return cur.xValue < 10 ? cur.yValue + acc : acc;
  }, 0) as number;

  const unwanted = [5, 35, 40, 85, 90, 95, 100];

  const xValues = totalData
    .map((d) => d.xValue)
    .filter((d) => {
      return !unwanted.includes(d);
    });

  const yValues = totalData.map(() => 0).slice(0, 14);

  const x1Values = totalData
    .map((d) => {
      return d.xValue + 5;
    })
    .filter((d) => {
      return !unwanted.includes(d);
    });

  const y1Values = totalData.reduce<number[]>((acc, cur) => {
    if (
      !unwanted.includes(cur.xValue) &&
      cur.xValue !== 80 &&
      cur.xValue !== 30 &&
      cur.xValue !== 0
    ) {
      acc.push(cur.yValue);
    }

    if (cur.xValue === 30) {
      acc.push(aboveThirtyAndLessThanfourtyFive);
    } else if (cur.xValue === 100) {
      acc.push(eightyPlus);
    } else if (cur.xValue === 0) {
      acc.push(zeroToTen);
    }

    return acc;
  }, []);

  class StickFigureTextureOptions implements ICustomTextureOptions {
    options: { stroke: string };
    textureHeight: number = 64;
    textureWidth: number = 32;
    repeat = true;

    public constructor(options: { stroke: string }) {
      this.options = options;
    }

    public createTexture(
      context: CanvasRenderingContext2D,
      options: { fill: string; opacity: number } & { stroke: string }
    ) {
      console.log(options);
      context.fillStyle = options.fill;
      context.fillRect(0, 0, this.textureWidth, this.textureHeight);
      context.strokeStyle = options.stroke;

      // Set up transformation: move to center, rotate, move back
      context.translate(this.textureWidth / 2, this.textureHeight / 2);
      context.rotate(Math.PI); // 180 degrees
      context.translate(-this.textureWidth / 2, -this.textureHeight / 2);

      // Proportional values
      const centerX = this.textureWidth / 2;
      const headRadius = Math.min(this.textureWidth, this.textureHeight) * 0.16; // 16% of smaller dimension
      const headY = this.textureHeight * 0.25;
      const bodyTopY = headY + headRadius;
      const bodyBottomY = this.textureHeight * 0.63;
      const armY = bodyTopY + this.textureHeight * 0.06;
      const armSpan = this.textureWidth * 0.38; // arms reach out 19% each side
      const legY = bodyBottomY;
      const legSpan = this.textureWidth * 0.25; // legs out 12.5% each side
      const legBottomY = this.textureHeight * 0.97;

      // Head
      context.beginPath();
      context.arc(centerX, headY, headRadius, 0, Math.PI * 2);
      context.stroke();

      // Body
      context.beginPath();
      context.moveTo(centerX, bodyTopY);
      context.lineTo(centerX, bodyBottomY);
      context.stroke();

      // Left Arm
      context.beginPath();
      context.moveTo(centerX, armY);
      context.lineTo(centerX - armSpan, armY + this.textureHeight * 0.09);
      context.stroke();

      // Right Arm
      context.beginPath();
      context.moveTo(centerX, armY);
      context.lineTo(centerX + armSpan, armY + this.textureHeight * 0.09);
      context.stroke();

      // Left Leg
      context.beginPath();
      context.moveTo(centerX, legY);
      context.lineTo(centerX - legSpan, legBottomY);
      context.stroke();

      // Right Leg
      context.beginPath();
      context.moveTo(centerX, legY);
      context.lineTo(centerX + legSpan, legBottomY);
      context.stroke();
    }
  }

  //FastRectangleRenderableSeries
  const rectangleSeries = new FastRectangleRenderableSeries(wasmContext, {
    dataSeries: new XyxyDataSeries(wasmContext, {
      xValues,
      yValues,
      x1Values,
      y1Values,
      // metadata,
    }),
    columnXMode: EColumnMode.StartEnd,
    columnYMode: EColumnYMode.TopBottom,
    dataPointWidth: 1,
    dataPointWidthMode: EDataPointWidthMode.Range,
    stroke: "black",
    strokeThickness: 2,
    fill: "steelblue",
    customTextureOptions: new StickFigureTextureOptions({ stroke: "black" }),
    opacity: 0.5,
    // defaultY1: 0,
    // resamplingMode: EResamplingMode.None,
    topCornerRadius: 2,
    bottomCornerRadius: 2,
    // dataLabels: {
    //   horizontalTextPosition: EHorizontalTextPosition.Right,
    //   verticalTextPosition: EVerticalTextPosition.Above,
    //   positionMode: EColumnDataLabelPosition.Outside,
    //   style: {
    //     fontSize: 16,
    //     padding: new Thickness(0, 0, 8, 32),
    //   },
    //   color: "#EEE",
    //   metaDataSelector: (md) => {
    //     const metadata = md as MetadataType;
    //     return metadata.label;
    //   },
    // },
    // this does not work
    // animation: new WaveAnimation({ duration: 1000 })
  });

  sciChartSurface.renderableSeries.add(rectangleSeries);

  sciChartSurface.title = [
    "Europe and Africa Population Distribution by Age Range",
  ];

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
