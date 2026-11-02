"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { validateProductEditDraft, type ProductEditDraft, type ProductEditDraftErrors } from "@/lib/product-validation";

export type EditableProduct = {
  id: string;
  sku: string;
  name: string;
  collection: string;
  retailCents: number;
  quantity: number;
  reorderPoint: number;
};

type Props = { product: EditableProduct; open: boolean; onClose: () => void; onSaved: () => void };

function priceInput(cents: number) { return (cents / 100).toFixed(2); }

export function EditProductDialog({ product, open, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<ProductEditDraft>({
    sku: product.sku,
    name: product.name,
    collection: product.collection,
    retailPrice: priceInput(product.retailCents),
    reorderPoint: String(product.reorderPoint),
  });
  const [errors, setErrors] = useState<ProductEditDraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const change = (field: keyof ProductEditDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateProductEditDraft(draft, [], product.sku);
    if (!result.success) { setErrors(result.errors); setFormError("Review the highlighted fields before saving."); return; }
    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json() as { fields?: ProductEditDraftErrors; error?: string };
      if (response.status === 400 || response.status === 409) {
        setErrors(payload.fields ?? {});
        setFormError(payload.error ?? "Review the product fields.");
        return;
      }
      if (!response.ok) throw new Error("Product update failed");
      onSaved();
    } catch {
      setFormError("The local inventory could not update this product. No changes were saved; try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { if (!saving) onClose(); }} fullWidth maxWidth="sm" aria-labelledby="edit-product-title">
      <form onSubmit={(event) => void submit(event)} noValidate>
        <DialogTitle id="edit-product-title" sx={{ fontFamily: "Georgia" }}>Edit product</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="info">Saved to the loopback development inventory. On-hand quantity stays unchanged; use audited stock movements when that workflow is available.</Alert>
            {formError && <Alert severity="error" role="alert">{formError}</Alert>}
            {(["name", "sku", "collection"] as const).map((field) => (
              <TextField key={field} autoFocus={field === "name"} label={{ name: "Product name", sku: "SKU", collection: "Collection" }[field]} value={draft[field]} required fullWidth error={Boolean(errors[field])} helperText={errors[field] ?? " "} onChange={(event) => change(field, event.target.value)} />
            ))}
            <TextField label="Retail price (USD)" value={draft.retailPrice} required fullWidth inputProps={{ inputMode: "decimal" }} error={Boolean(errors.retailPrice)} helperText={errors.retailPrice ?? " "} onChange={(event) => change("retailPrice", event.target.value)} />
            <TextField label="Reorder point" value={draft.reorderPoint} required fullWidth inputProps={{ inputMode: "numeric" }} error={Boolean(errors.reorderPoint)} helperText={`${errors.reorderPoint ?? " "} Current on hand: ${product.quantity}`} onChange={(event) => change("reorderPoint", event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button type="button" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
