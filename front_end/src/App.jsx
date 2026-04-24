import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Chat from "./pages/Chat";
import Pricing  from "./pages/Pricing";
import PricingDetail from "./pages/PricingDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/pricing/:productName" element={<PricingDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
