import React, { useState, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useWallet } from "./useWallet.js";
import { useRegionStats, useReportsByRegion, useP2Trend } from "./hooks/useStats.js";
import { useAuditLedger } from "./hooks/useAuditLedger.js";
import { FALLBACK_JABAR_STATS } from "./constants/auditData.js";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import ReportsSection from "./components/ReportsSection.jsx";
import AboutSection from "./components/AboutSection.jsx";
import VerificationFlow from "./components/VerificationFlow.jsx";
import RegionDisparity from "./components/RegionDisparity.jsx";
import AuditLedger from "./components/AuditLedger.jsx";
import CtaSection from "./components/CtaSection.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";
import TxInspectorModal from "./components/TxInspectorModal.jsx";
import OfficerWizardModal from "./components/OfficerWizardModal.jsx";
import OfficerLoginModal from "./components/OfficerLoginModal.jsx";
import OfficerDashboard from "./pages/OfficerDashboard.jsx";
import "leaflet/dist/leaflet.css";

function PublicPortal({
  wallet,
  activeTab,
  setActiveTab,
  mapMetric,
  setMapMetric,
  selectedRegionCode,
  setSelectedRegionCode,
  aiModelVersion,
  setAiModelVersion,
  selectedTxForModal,
  setSelectedTxForModal,
  isOfficerModalOpen,
  setIsOfficerModalOpen,
  isLoginModalOpen,
  setIsLoginModalOpen,
  toastMessage,
  showToast,
  auditRecords,
  addRecord,
  simulateDisburse,
  simulateDuplicate,
  kpis,
  enrichedRegions,
  activeRegion,
  p2TrendHistory,
  trendLoading
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleOpenOfficer = () => {
    if (isAuthenticated) {
      navigate("/officer");
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050f18] text-white selection:bg-[#479ece]/30 selection:text-white font-sans">
      <Navbar
        activeTab={activeTab}
        onToggleReports={() => setActiveTab((t) => (t === "reports" ? "home" : "reports"))}
        wallet={wallet}
        onOpenOfficerModal={handleOpenOfficer}
      />

      <HeroSection
        enrichedRegions={enrichedRegions}
        selectedRegionCode={selectedRegionCode}
        onSelectRegion={setSelectedRegionCode}
        activeRegion={activeRegion}
        mapMetric={mapMetric}
        setMapMetric={setMapMetric}
        onOpenOfficerModal={handleOpenOfficer}
      />

      <ReportsSection
        isOpen={activeTab === "reports"}
        onClose={() => setActiveTab("home")}
      />

      <AboutSection aiModelVersion={aiModelVersion} />

      <VerificationFlow {...kpis} />

      <RegionDisparity
        activeRegion={activeRegion}
        p2TrendHistory={p2TrendHistory}
        trendLoading={trendLoading}
      />

      <AuditLedger
        auditRecords={auditRecords}
        onSimulateDisburse={simulateDisburse}
        onSimulateDuplicate={simulateDuplicate}
        onSelectTx={setSelectedTxForModal}
      />

      <CtaSection onOpenOfficerModal={handleOpenOfficer} />

      <Footer />

      <Toast message={toastMessage} />

      <TxInspectorModal
        tx={selectedTxForModal}
        onClose={() => setSelectedTxForModal(null)}
      />

      <OfficerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          showToast("Berhasil masuk sebagai Petugas Verifikator Wilayah.");
        }}
      />

      <OfficerWizardModal
        isOpen={isOfficerModalOpen}
        onClose={() => setIsOfficerModalOpen(false)}
        auditCount={auditRecords.length}
        walletAddress={wallet.address}
        onModelVersionChange={setAiModelVersion}
        onSubmitRecord={(newRecord) => {
          addRecord(newRecord);
          showToast(`Penyaluran ${newRecord.refId} berhasil dicatat on-chain Polygon Amoy!`);
        }}
      />
    </div>
  );
}

export default function App() {
  const wallet = useWallet();
  const { data: regionStats } = useRegionStats();
  const { data: reportCounts } = useReportsByRegion();

  const [activeTab, setActiveTab] = useState("home");
  const [mapMetric, setMapMetric] = useState("p2");
  const [selectedRegionCode, setSelectedRegionCode] = useState("3201");
  const [aiModelVersion, setAiModelVersion] = useState("lr-jabar-multidim-2.0");
  const [selectedTxForModal, setSelectedTxForModal] = useState(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const { auditRecords, addRecord, simulateDisburse, simulateDuplicate, kpis } =
    useAuditLedger(wallet.address, showToast);

  const enrichedRegions = useMemo(() => {
    const sourceStats = regionStats.length > 0 ? regionStats : FALLBACK_JABAR_STATS;
    return sourceStats.map((s) => ({
      ...s,
      laporan_verified: reportCounts[String(s.kode)] || 0,
    }));
  }, [regionStats, reportCounts]);

  const activeRegion = useMemo(
    () =>
      enrichedRegions.find((r) => String(r.kode) === String(selectedRegionCode)) ||
      enrichedRegions[0],
    [enrichedRegions, selectedRegionCode]
  );

  const { trend: p2TrendHistory, loading: trendLoading } = useP2Trend(activeRegion.kode);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicPortal
            wallet={wallet}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mapMetric={mapMetric}
            setMapMetric={setMapMetric}
            selectedRegionCode={selectedRegionCode}
            setSelectedRegionCode={setSelectedRegionCode}
            aiModelVersion={aiModelVersion}
            setAiModelVersion={setAiModelVersion}
            selectedTxForModal={selectedTxForModal}
            setSelectedTxForModal={setSelectedTxForModal}
            isOfficerModalOpen={isOfficerModalOpen}
            setIsOfficerModalOpen={setIsOfficerModalOpen}
            isLoginModalOpen={isLoginModalOpen}
            setIsLoginModalOpen={setIsLoginModalOpen}
            toastMessage={toastMessage}
            showToast={showToast}
            auditRecords={auditRecords}
            addRecord={addRecord}
            simulateDisburse={simulateDisburse}
            simulateDuplicate={simulateDuplicate}
            kpis={kpis}
            enrichedRegions={enrichedRegions}
            activeRegion={activeRegion}
            p2TrendHistory={p2TrendHistory}
            trendLoading={trendLoading}
          />
        }
      />
      <Route path="/officer" element={<OfficerDashboard />} />
    </Routes>
  );
}