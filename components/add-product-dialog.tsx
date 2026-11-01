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
  existingSkus: readonly string[];
  onClose: () => void;
  onSave: (product: ValidatedProductDraft) => void;
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

export function AddProductDialog({ open, existingSkus, onClose, onSave }: AddProductDialogProps) {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [fieldErrors, setFieldErrors] = useState<ProductDraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [checkingSku, setCheckingSku] = useState(false);

  const reset = () => {
    setDraft(initialDraft);
    setFieldErrors({});
    setFormError(null);
  };

  const close = () => {
    if (checkingSku) return;
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
    const result = validateProductDraft(draft, existingSkus);

    if (!result.success) {
      setFieldErrors(result.errors);
      setFormError("Review the highlighted fields before adding this product.");
      return;
    }

    setCheckingSku(true);
    setFormError(null);

    try {
      if (process.env.NODE_ENV !== "production") {
        const response = await fetch(`/api/products/sku-availability?sku=${encodeURIComponent(result.data.sku)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("SKU check failed");

        const availability = (await response.json()) as { available?: boolean };
        if (availability.available !== true) {
          setFieldErrors({ sku: "A product with this SKU already exists." });
          setFormError("Choose a different SKU before adding this product.");
          return;
        }
      }

      onSave(result.data);
      reset();
    } catch {
      setFormError("The local catalog could not confirm this SKU. No product was added; try again when it is available.");
    } finally {
      setCheckingSku(false);
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
            <Alert severity="info">Preview only: products added here stay in this browser session and are not saved to inventory.</Alert>
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
          <Button type="button" onClick={close} disabled={checkingSku}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={checkingSku} sx={{ bgcolor: "#292f31" }}>
            {checkingSku ? "Checking SKU…" : "Add preview product"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
