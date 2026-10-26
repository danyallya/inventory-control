"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
type DisplayMode = { dark: boolean; toggle: () => void };
const ModeContext = createContext<DisplayMode>({ dark: false, toggle: () => {} });
export const useDisplayMode = () => useContext(ModeContext);
export function Providers({ children }: { children: ReactNode }) {
 const [dark, setDark] = useState(false);
 const theme = useMemo(() => createTheme({
  palette: { mode: dark ? "dark" : "light", primary: { main: "#a98243" }, background: { default: dark ? "#15191d" : "#f4f3ef", paper: dark ? "#20262b" : "#fff" }, text: { primary: dark ? "#f0ede7" : "#24282b", secondary: dark ? "#a7adae" : "#777c7e" } },
  shape: { borderRadius: 10 }, typography: { fontFamily: "Arial, sans-serif", button: { textTransform: "none", fontWeight: 600 } },
 }), [dark]);
 const value = useMemo(() => ({ dark, toggle: () => setDark((v) => !v) }), [dark]);
 return <ModeContext.Provider value={value}><ThemeProvider theme={theme}><CssBaseline/>{children}</ThemeProvider></ModeContext.Provider>;
}