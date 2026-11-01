"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FiArrowLeft, FiMoon, FiSun, FiX } from "react-icons/fi";
import { useDisplayMode } from "../providers";

const PAGE_SIZE = 8;

type Product = {
  id: string;
  sku: string;
  name: string;
  collection: string;
  retailCents: number;
  quantity: number;
  reorderPoint: number;
};

type ProductPage = {
  data: Product[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function StockStatus({ product }: { product: Product }) {
  const low = product.quantity <= product.reorderPoint;
  return <Chip size="small" label={low ? "Reorder" : "In stock"} color={low ? "warning" : "success"} variant="outlined" />;
}

export function CatalogBrowser() {
  const { dark, toggle } = useDisplayMode();
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    fetch(`/api/products?page=${page}&pageSize=${PAGE_SIZE}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return (await response.json()) as ProductPage;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setResult(payload);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, retry]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    setDetail(null);
    setDetailError(false);
    setDetailLoading(true);

    fetch(`/api/products/${encodeURIComponent(selectedId)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Product request failed");
        return (await response.json()) as { data: Product };
      })
      .then((payload) => {
        if (!controller.signal.aborted) setDetail(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetailError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });

    return () => controller.abort();
  }, [selectedId]);

  const closeDetails = () => {
    setSelectedId(null);
    setDetail(null);
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 1.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Button component={NextLink} href="/" startIcon={<FiArrowLeft />} sx={{ color: "text.primary" }}>
          Overview
        </Button>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 10, letterSpacing: 1.8, color: "text.secondary" }}>
            SABLE LEDGER
          </Typography>
          <IconButton onClick={toggle} aria-label="Toggle color theme" size="small">
            {dark ? <FiSun /> : <FiMoon />}
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}>
        <Typography sx={{ fontSize: 9, letterSpacing: 1.6, color: "text.secondary" }}>MERCHANT TOOLS / INVENTORY</Typography>
        <Typography component="h1" sx={{ mt: 1, mb: 0.5, fontFamily: "Georgia", fontSize: { xs: 31, md: 40 }, fontWeight: 400 }}>
          Product catalog
        </Typography>
        <Typography sx={{ mb: 3, color: "text.secondary", fontSize: 12 }}>
          A read-only local preview of the catalog in the development database.
        </Typography>

        {loading && (
          <Stack role="status" direction="row" spacing={1.5} alignItems="center" sx={{ py: 5, justifyContent: "center" }}>
            <CircularProgress size={20} aria-label="Loading catalog" />
            <Typography>Loading catalog…</Typography>
          </Stack>
        )}

        {!loading && loadError && (
          <Alert severity="error" action={<Button color="inherit" onClick={() => setRetry((value) => value + 1)}>Retry</Button>}>
            The catalog could not be loaded. Try again.
          </Alert>
        )}

        {!loading && !loadError && result?.data.length === 0 && result.pagination.totalItems === 0 && (
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
            <Typography sx={{ fontFamily: "Georgia", fontSize: 22 }}>No products yet</Typography>
            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}>
              This local catalog has no saved products. The setup seed adds a fictional opening item.
            </Typography>
          </Paper>
        )}

        {!loading && !loadError && result?.data.length === 0 && result.pagination.totalItems > 0 && (
          <Alert severity="info" action={<Button color="inherit" onClick={() => setPage(1)}>First page</Button>}>
            No products are available on this page. Return to the first page.
          </Alert>
        )}

        {!loading && !loadError && Boolean(result?.data.length) && (
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box>
                <Typography sx={{ fontFamily: "Georgia", fontSize: 19 }}>Inventory records</Typography>
                <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 10 }}>
                  {result?.pagination.totalItems} {result?.pagination.totalItems === 1 ? "product" : "products"}
                </Typography>
              </Box>
              <Typography sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary", fontSize: 10 }}>
                Unit costs are kept out of this preview.
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, p: 1.5 }}>
              {result?.data.map((product) => (
                <Paper key={product.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{product.name}</Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{product.collection} · {product.sku}</Typography>
                    </Box>
                    <StockStatus product={product} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                    <Typography sx={{ fontSize: 12 }}>{product.quantity} on hand · {formatPrice(product.retailCents)}</Typography>
                    <Button size="small" onClick={() => setSelectedId(product.id)} aria-label={`View details for ${product.name}`}>
                      Details
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table aria-label="Product catalog" size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell scope="col">Product</TableCell>
                    <TableCell scope="col">SKU</TableCell>
                    <TableCell scope="col">Collection</TableCell>
                    <TableCell scope="col" align="right">On hand</TableCell>
                    <TableCell scope="col" align="right">Retail</TableCell>
                    <TableCell scope="col">Status</TableCell>
                    <TableCell scope="col" align="right">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result?.data.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.collection}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(product.retailCents)}</TableCell>
                      <TableCell><StockStatus product={product} /></TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelectedId(product.id)} aria-label={`View details for ${product.name}`}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography aria-live="polite" sx={{ color: "text.secondary", fontSize: 10 }}>
                Page {result?.pagination.page} of {Math.max(1, result?.pagination.totalPages ?? 0)}
              </Typography>
              {(result?.pagination.totalPages ?? 0) > 1 && (
                <Pagination
                  count={result?.pagination.totalPages ?? 1}
                  page={page}
                  onChange={(_event, nextPage) => setPage(nextPage)}
                  color="primary"
                  aria-label="Catalog pages"
                />
              )}
            </Stack>
          </Paper>
        )}
      </Box>

      <Dialog open={selectedId !== null} onClose={closeDetails} fullWidth maxWidth="sm" aria-labelledby="product-details-title">
        <DialogTitle id="product-details-title" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Georgia" }}>
          Product details
          <IconButton onClick={closeDetails} aria-label="Close product details"><FiX /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading && <Stack role="status" alignItems="center" sx={{ py: 4 }}><CircularProgress aria-label="Loading product details" /></Stack>}
          {detailError && <Alert severity="error">Product details could not be loaded. Close this panel and try again.</Alert>}
          {detail && !detailLoading && (
            <Stack spacing={1.5}>
              <Typography sx={{ fontFamily: "Georgia", fontSize: 24 }}>{detail.name}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{detail.collection} · {detail.sku}</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Paper variant="outlined" sx={{ flex: 1, p: 1.5 }}><Typography sx={{ color: "text.secondary", fontSize: 10 }}>On hand</Typography><Typography sx={{ mt: 0.5, fontSize: 20 }}>{detail.quantity}</Typography></Paper>
                <Paper variant="outlined" sx={{ flex: 1, p: 1.5 }}><Typography sx={{ color: "text.secondary", fontSize: 10 }}>Reorder point</Typography><Typography sx={{ mt: 0.5, fontSize: 20 }}>{detail.reorderPoint}</Typography></Paper>
                <Paper variant="outlined" sx={{ flex: 1, p: 1.5 }}><Typography sx={{ color: "text.secondary", fontSize: 10 }}>Retail price</Typography><Typography sx={{ mt: 0.5, fontSize: 20 }}>{formatPrice(detail.retailCents)}</Typography></Paper>
              </Stack>
              <Typography sx={{ color: "text.secondary", fontSize: 10 }}>Unit cost is not included in the catalog preview.</Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
