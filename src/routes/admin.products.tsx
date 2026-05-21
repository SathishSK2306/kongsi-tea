import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { formatINR, genId } from "@/lib/format";

const categories = [
  { value: "imported_materials", label: "Imported Materials" },
  { value: "packaging_supplies", label: "Packaging Supplies" },
  { value: "food_menu", label: "Food Menu" },
  { value: "desserts", label: "Desserts" },
];

const emptyProduct = {
  product_name: "",
  category: "food_menu",
  description: "",
  image: "",
  price: 0,
  stock_qty: 0,
  unit: "unit",
};

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
  head: () => ({ meta: [{ title: "Manage Products — Kongsi" }] }),
});

function AdminProductsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageBucketName = "product-images";

  async function handleLocalImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const filePath = `${imageBucketName}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(imageBucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(imageBucketName)
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) throw new Error("Unable to get public URL.");

      setForm((prev) => ({ ...prev, image: publicUrlData.publicUrl }));
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error("Image upload failed. Ensure the storage bucket exists.");
      console.error(err);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  }

  function triggerImageUpload() {
    fileInputRef.current?.click();
  }

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [authLoading, isAdmin, navigate]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    enabled: !authLoading && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_id, product_name, category, description, image, price, stock_qty, unit");
      if (error) throw error;
      return data;
    },
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      product_name: form.product_name.trim(),
      category: form.category,
      description: form.description.trim(),
      image: form.image.trim(),
      price: Number(form.price) || 0,
      stock_qty: Number(form.stock_qty) || 0,
      unit: form.unit.trim() || "unit",
    };

    try {
      if (!payload.product_name) {
        toast.error("Product name is required.");
        return;
      }

      if (editingId) {
        const { error } = await supabase.from("products").update(payload as never).eq("id", editingId);
        if (error) throw error;
        toast.success("Product updated successfully.");
      } else {
        const { error } = await supabase.from("products").insert({
          product_id: genId("PR-"),
          ...payload,
        } as never);
        if (error) throw error;
        toast.success("Product added successfully.");
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err) {
      toast.error("Unable to save product.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error("Unable to delete product.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product: any) {
    setEditingId(product.id);
    setForm({
      product_name: product.product_name ?? "",
      category: product.category ?? "food_menu",
      description: product.description ?? "",
      image: product.image ?? "",
      price: product.price ?? 0,
      stock_qty: product.stock_qty ?? 0,
      unit: product.unit ?? "unit",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProduct);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin / Products</p>
            <h1 className="font-serif text-4xl">Manage Products</h1>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="size-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 items-start xl:grid-cols-[420px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border/60 rounded-3xl p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Add / edit product</h2>
              <p className="text-sm text-muted-foreground">Add a new product or update existing catalog details.</p>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="product_name">Product name</Label>
                <Input
                  id="product_name"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="Black tea powder"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Short product details"
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="image">Image URL</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={triggerImageUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Upload local image"}
                  </Button>
                </div>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLocalImageUpload}
                />
                {form.image ? (
                  <div className="mt-3 rounded-3xl border border-border/60 overflow-hidden">
                    <img src={form.image} alt="Product preview" className="h-48 w-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="stock_qty">Quantity</Label>
                  <Input
                    id="stock_qty"
                    type="number"
                    value={form.stock_qty}
                    onChange={(e) => setForm({ ...form, stock_qty: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="unit"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={saving} className="rounded-full">
                  {editingId ? "Update product" : "Add product"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="secondary" onClick={resetForm} className="rounded-full">
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border/60 rounded-3xl p-5"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Product catalog</h2>
                <p className="text-sm text-muted-foreground">Edit and remove products from your catalog.</p>
              </div>
              <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{products?.length ?? 0} items</div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground">Loading products...</div>
            ) : error ? (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-red-700">
                <p className="font-medium">Unable to load products.</p>
                <p className="mt-2 text-sm">{String(error)}</p>
              </div>
            ) : !products || products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No products found yet.</div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-4 rounded-3xl border border-border/50 bg-background/70 p-4 shadow-[0_20px_50px_-30px_rgba(67,51,27,0.55)] transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="h-28 min-w-28 overflow-hidden rounded-3xl bg-muted/20 shadow-inner">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-foreground">{product.product_name}</h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
                        <p className="mt-4 text-sm text-muted-foreground">Product ID: {product.product_id}</p>
                      </div>
                      <div className="flex flex-col items-start gap-3 rounded-3xl bg-card/70 p-3 text-right shadow-sm md:items-end">
                        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 shadow-inner shadow-amber-100/70">
                          {formatINR(Number(product.price))}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.stock_qty} {product.unit}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" onClick={() => handleEdit(product)} className="gap-2">
                            <Edit3 className="size-4" /> Edit
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => handleDelete(product.id)} className="gap-2">
                            <Trash2 className="size-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
