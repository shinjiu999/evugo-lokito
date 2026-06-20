declare module "gifshot" {
  interface GIFOptions {
    images?: string[] | HTMLImageElement[];
    video?: string | string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numWorkers?: number;
    filter?: string;
    text?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    watermark?: string;
    watermarkHeight?: number;
    watermarkWidth?: number;
    watermarkX?: number;
    watermarkY?: number;
    keepCameraOn?: boolean;
    cameraZoomLevel?: number;
  }

  interface GIFResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string;
  }

  function createGIF(
    options: GIFOptions,
    callback: (result: GIFResult) => void
  ): void;

  function isWebCamGIFSupported(): boolean;
  function isSupported(): boolean;
}
