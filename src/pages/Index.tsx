import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/WeatherWidget";
import ErrorBoundary from "@/components/ErrorBoundary";
import SupportCard from "@/components/SupportCard";
import HrContactCard from "@/components/HrContactCard";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { EmployeeDataProvider } from "@/contexts/EmployeeDataContext";

// Lazy loading dos componentes pesados
const EmployeeDirectory = lazy(() => import("@/components/EmployeeDirectory"));
const AnnouncementManager = lazy(() => import("@/components/AnnouncementManager"));
const LunchHours = lazy(() => import("@/components/LunchHours"));
const AdminPanel = lazy(() => import("@/components/AdminPanel"));
const Chatbot = lazy(() => import("@/components/Chatbot"));

// Componente de loading para seções
const SectionLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

const Index = () => {
  const {
    announcements,
    updateAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    uploadAnnouncementImage,
    isLoading,
    isSupabaseConnected,
    exportData,
    importData,
    restoreFromBackup,
    resetAnnouncements
  } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <EmployeeDataProvider>
        <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 pb-12">
          <div className="mb-6">
            <WeatherWidget />
          </div>

          <section
            className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2"
            aria-label="Canais de atendimento"
          >
            <SupportCard />
            <HrContactCard />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <ErrorBoundary>
              <div className="xl:col-span-2 order-1 animate-slide-in-left">
                <Suspense fallback={<SectionLoader />}>
                  <AnnouncementManager
                    announcements={announcements}
                    onAnnouncementsChange={updateAnnouncements}
                    exportData={exportData}
                    importData={importData}
                    restoreFromBackup={restoreFromBackup}
                    resetAnnouncements={resetAnnouncements}
                  />
                </Suspense>
              </div>
            </ErrorBoundary>

            <ErrorBoundary>
              <div className="xl:col-span-1 order-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <Suspense fallback={<SectionLoader />}>
                  <EmployeeDirectory />
                </Suspense>
              </div>
            </ErrorBoundary>
          </div>
          
          {/* Seção de Horários de Almoço - Movida para o final */}
          <ErrorBoundary>
            <div className="mt-8 animate-fade-in">
              <Suspense fallback={<SectionLoader />}>
                <LunchHours />
              </Suspense>
            </div>
          </ErrorBoundary>

          {/* Acesso administrativo no final do conteúdo */}
          <div className="mt-6 flex justify-end">
            <Suspense fallback={<SectionLoader />}>
              <AdminPanel
                announcements={announcements}
                onAnnouncementsChange={updateAnnouncements}
                onAddAnnouncement={addAnnouncement}
                onUpdateAnnouncement={updateAnnouncement}
                onDeleteAnnouncement={deleteAnnouncement}
                onUploadAnnouncementImage={uploadAnnouncementImage}
                isSupabaseConnected={isSupabaseConnected}
                exportData={exportData}
                importData={importData}
                restoreFromBackup={restoreFromBackup}
                resetAnnouncements={resetAnnouncements}
              />
            </Suspense>
          </div>

        </main>
        <Footer />
        
        {/* Chatbot - Ocultado temporariamente */}
        {/* <Chatbot /> */}
        </div>
      </EmployeeDataProvider>
    </ErrorBoundary>
  );
};

export default Index;
