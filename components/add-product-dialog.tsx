"use client";

import { useState, type FormEvent } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import {
  type ProductDraft,
  type ProductDraftErrors,
  type ProductDraftField,
  type ValidatedProductDraft,
  validateProductDraft,
} from "@/lib/product-validation";

type AddProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (product: ValidatedProductDraft & { id: string; createdAt: string; updatedAt: string }) => void;
};

const initialDraft: ProductDraft = {
  sku: "",
  name: "",
  collection: "Objects",
  unitCost: "",
  retailPrice: "",
  quantity: "0",
  reorderPoint: "3",
};

const fieldLabels: Record<ProductDraftField, string> = {
  name: "Product name",
  sku: "SKU",
  collection: "Collection",
  unitCost: "Unit cost (USD)",
  retailPrice: "Retail price (USD)",
  quantity: "Opening quantity",
  reorderPoint: "Reorder point",
};

export function AddProductDialog({ open, onClose, onSave }: AddProductDialogProps) {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [fieldErrors, setFieldErrors] = useState<ProductDraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setDraft(initialDraft);
    setFieldErrors({});
    setFormError(null);
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const updateField = (field: ProductDraftField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateProductDraft(draft);

    if (!result.success) {
      setFieldErrors(result.errors);
      setFormError("Review the highlighted fields before adding this product.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json() as { data?: { id: string; sku: string; name: string; collection: string; retailCents: number; quantity: number; reorderPoint: number; createdAt: string; updatedAt: string }; fields?: ProductDraftErrors; error?: string };
      if (response.status === 400 || response.status === 409) {
        setFieldErrors(payload.fields ?? {});
        setFormError(payload.error ?? "Review the product fields before saving.");
        return;
      }
      if (!response.ok || !payload.data) throw new Error("Product save failed");
      onSave({ ...result.data, ...payload.data });
      reset();
    } catch {
      setFormError("The local inventory could not save this product. No changes were made; check the development database and try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: ProductDraftField, options: { inputMode?: "decimal" | "numeric" } = {}) => (
    <TextField
      key={field}
      autoFocus={field === "name"}
      fullWidth
      required
      label={fieldLabels[field]}
      name={field}
      type="text"
      value={draft[field]}
      error={Boolean(fieldErrors[field])}
      helperText={fieldErrors[field] ?? " "}
      inputProps={options.inputMode ? { inputMode: options.inputMode } : undefined}
      onChange={(event) => updateField(field, event.target.value)}
    />
  );

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="add-product-title">
      <Box component="form" onSubmit={(event) => void submit(event)} noValidate>
        <DialogTitle id="add-product-title" sx={{ fontFamily: "Georgia" }}>Add a product</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
          <Alert severity="info">Saved to the loopback development inventory only. Opening stock is recorded as an initial receipt; staff sign-in is not implemented yet.</Alert>
            {formError && <Alert severity="error" role="alert">{formError}</Alert>}
            {renderField("name")}
            {renderField("sku")}
            {renderField("collection")}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {renderField("unitCost", { inputMode: "decimal" })}
              {renderField("retailPrice", { inputMode: "decimal" })}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {renderField("quantity", { inputMode: "numeric" })}
              {renderField("reorderPoint", { inputMode: "numeric" })}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button type="button" onClick={close} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: "#292f31" }}>
            {saving ? "Saving…" : "Save product"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
