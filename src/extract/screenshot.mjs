// Screenshot of the source page, as proof beside the extracted tokens.
//
// Format is WebP, not the AVIF the plan names. Chromium cannot encode AVIF:
// `canvas.toBlob(cb, 'image/avif')` silently hands back a PNG, with `blob.type`
// reading "image/png" — so a naive implementation writes PNG bytes into a file
// called .avif and nothing complains. Encoding AVIF properly would mean a native
// dependency (sharp/libavif) in a pipeline that otherwise needs only the browser
// we already run. WebP is browser-encoded, universally supported, and roughly a
// quarter the size of the PNG.

/** Viewport-sized, not full-page: this is a proof shot, and full-page captures
 *  of a marketing site run to tens of megabytes before compression. */
export async function captureScreenshot(page, { quality = 0.72 } = {}) {
  const png = await page.screenshot({ type: 'png' });

  // Re-encode inside the page rather than shipping a native encoder. The PNG
  // goes in as a data URL and the WebP comes back base64, chunked because
  // String.fromCharCode(...bytes) overflows the stack on anything this size.
  const encoded = await page.evaluate(async ({ src, q }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${src}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', q));
    if (!blob || blob.type !== 'image/webp') return null;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { data: btoa(binary), width: canvas.width, height: canvas.height };
  }, { src: png.toString('base64'), q: quality });

  // A refusal to encode is reported, not papered over with the PNG: a file whose
  // extension lies about its contents is worse than no file.
  if (!encoded) return null;
  return {
    buffer: Buffer.from(encoded.data, 'base64'),
    width: encoded.width,
    height: encoded.height,
    format: 'webp',
  };
}
