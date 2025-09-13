import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./provider/ThemeProvider";
import queryClient from "./queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "./slice/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider />
        <Toaster richColors expand={true} />
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
