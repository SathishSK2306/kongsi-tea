import imported from "@/assets/cat-imported.jpg";
import packaging from "@/assets/cat-packaging.jpg";
import food from "@/assets/cat-food.jpg";
import desserts from "@/assets/cat-desserts.jpg";

export type CategoryKey = "imported_materials" | "packaging_supplies" | "food_menu" | "desserts";

export const CATEGORIES: { key: CategoryKey; label: string; tagline: string; image: string }[] = [
  { key: "imported_materials", label: "Imported Materials", tagline: "Premium teas, syrups & boba", image: imported },
  { key: "packaging_supplies", label: "Packaging & Supplies", tagline: "Branded bottles, boxes & more", image: packaging },
  { key: "food_menu",         label: "Food Menu Items",     tagline: "Sourdough, momos & wings",   image: food },
  { key: "desserts",          label: "Desserts",            tagline: "Cookies & chocolate shots",  image: desserts },
];

export const CATEGORY_IMG: Record<CategoryKey, string> = {
  imported_materials: imported,
  packaging_supplies: packaging,
  food_menu: food,
  desserts: desserts,
};

export const categoryLabel = (k: string) =>
  CATEGORIES.find((c) => c.key === k)?.label ?? k;
