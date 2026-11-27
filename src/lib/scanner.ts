/**
 * Lecteur de codes-barres.
 * - Android / Chrome : lecteur natif du navigateur (BarcodeDetector).
 * - iPhone (Safari, Chrome iOS) : pas de lecteur natif → ZXing compilé en WebAssembly,
 *   embarqué dans l'app (fonctionne hors ligne, chargé seulement à l'ouverture du scan).
 */
export interface Detector { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> }

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

export async function createDetector(): Promise<Detector> {
  const Native = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
  if (Native) {
    try { return new Native({ formats: FORMATS }); } catch { /* repli sur ZXing */ }
  }
  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ]);
  prepareZXingModule({
    overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
  });
  return new BarcodeDetector({ formats: FORMATS as never }) as unknown as Detector;
}

export const hasCamera = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
