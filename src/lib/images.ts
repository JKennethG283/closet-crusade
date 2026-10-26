export const IMAGE_BUCKET = "item-images";

export function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

export function sortImages<T extends { position: number }>(images: T[]) {
  return [...images].sort((a, b) => a.position - b.position);
}
