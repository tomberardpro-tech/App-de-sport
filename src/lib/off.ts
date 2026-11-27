/** Open Food Facts : base alimentaire ouverte et gratuite. */
export interface OffProduct { name: string; brand?: string; kcal100?: number; barcode: string }

export async function fetchByBarcode(code: string): Promise<OffProduct | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_fr,brands,nutriments`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments ?? {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : undefined);
  return {
    name: p.product_name_fr || p.product_name || 'Produit sans nom',
    brand: p.brands?.split(',')[0]?.trim(),
    kcal100: kcal !== undefined ? Math.round(kcal) : undefined,
    barcode: code,
  };
}

