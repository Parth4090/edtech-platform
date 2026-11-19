import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Loader2,
  ShoppingCart,
  Download,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PdfViewerModalProps {
  materialId: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ materialId, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [materialInfo, setMaterialInfo] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    let activeBlobUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setIsLocked(false);
      setErrorMessage(null);

      try {
        // 1. Fetch metadata
        const infoRes = await api.get(`/materials/${materialId}/info`);
        setMaterialInfo(infoRes.data.material);

        // 2. Fetch authenticated stream
        const response = await api.get(`/materials/${materialId}/stream`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        activeBlobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(activeBlobUrl);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsLocked(true);
          setErrorMessage(
            err.response?.data?.error ||
              'This study material is locked. You must purchase this chapter or subject package to view.'
          );
        } else {
          setErrorMessage(err.response?.data?.error || 'Unable to load study material.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [materialId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-5xl w-full h-[90vh]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="bg-navy-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">
                {materialInfo ? materialInfo.title : 'Secure PDF Reader'}
              </h3>
              {materialInfo?.chapter && (
                <p className="text-[11px] text-slate-300 truncate">
                  {materialInfo.chapter.subject?.name} • Chapter {materialInfo.chapter.chapterNumber}
                  {materialInfo.chapter.isFree && (
                    <span className="ml-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                      • Free Sample
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isLocked && pdfBlobUrl && (
              <>
                <div className="hidden sm:flex items-center space-x-1 bg-navy-800/80 rounded-xl px-2 py-1 text-xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="p-1 hover:text-brand-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-slate-300 w-10 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1 hover:text-brand-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-navy-800 rounded-xl transition"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-navy-800 rounded-xl transition ml-2"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-slate-200/70 relative overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Verifying authorization and decrypting PDF stream...
              </p>
            </div>
          ) : isLocked ? (
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-5 m-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  Locked Study Material
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-2">Access Forbidden (403)</h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {errorMessage ||
                    'You do not have active entitlement to view this material. Please purchase this chapter notes or an All-Access Pass.'}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/catalogue');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-navy-900 hover:from-brand-500 hover:to-navy-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Browse Catalogue & Purchase
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : pdfBlobUrl ? (
            <div className="w-full h-full relative overflow-auto flex justify-center p-4">
              {/* Dynamic Security Watermark */}
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-around items-center opacity-[0.06] select-none text-slate-900 font-extrabold text-2xl tracking-widest rotate-[-25deg]">
                <span>EDTECH ACADEMY • {user?.email || 'STUDENT USE ONLY'}</span>
                <span>PROTECTED COPYRIGHT • STRICTLY CONFIDENTIAL</span>
                <span>LICENSE ID: {user?.id || 'REGISTERED_STUDENT'}</span>
              </div>

              {/* PDF Container */}
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title="Protected Study Material"
                className="w-full h-full rounded-2xl bg-white shadow-lg border border-slate-300"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
              />
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p>Failed to load PDF document.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
