export type ItemStatus = "available" | "reserved" | "sold";

export type ItemImage = {
  id: string;
  path: string;
  position: number;
};

export type Item = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  condition: string;
  description: string;
  price_sgd: number;
  status: ItemStatus;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  item_images: ItemImage[];
};

export const ITEM_SELECT =
  "id, slug, name, brand, size, condition, description, price_sgd, status, is_published, sort_order, created_at, item_images (id, path, position)";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};
