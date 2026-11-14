import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FilePlus2,
  Globe,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CompanyInfoModal } from './components/CompanyInfoModal';
import { ProformaInvoiceSheet } from './components/ProformaInvoiceSheet';
import { SmartImportModal } from './components/SmartImportModal';
import {
  createBlankPi,
  DEFAULT_BANK_INFO,
  DEFAULT_SELLER_INFO,
  formatPiDate,
  generatePiNumber,
} from './data/companyDefaults';
import {
  BankInfo,
  PaymentPlanType,
  PiLanguage,
  ProductItem,
  ProformaInvoiceData,
  SellerInfo,
  ShipmentModeKey,
} from './types/pi';
import {
  calculateSplitAmounts,
  formatUsd,
  numberToUsdWords,
} from './utils/numberToWords';
import {
  buildTransportRoute,
  inferShipping,
  ORIGIN_PORT_PRESETS,
  SHIPMENT_MODES,
} from './utils/shippingMatcher';
import { SmartImportResult } from './utils/smartImportParser';

const STORAGE_PI_KEY = 'huichida_pi_draft_v1';
const STORAGE_COMPANY_KEY = 'yitong_pi_company_v1';

type ZoomMode = 'fit' | '75' | '100';

const LANGUAGE_OPTIONS: { id: PiLanguage; label: string; short: string }[] = [
  { id: 'en', label: '英文版 English', short: 'EN' },
  { id: 'fr', label: '法文版 Français', short: 'FR' },
  { id: 'es', label: '西班牙语版 Español', short: 'ES' },
];

function hydratePiDraft(raw: unknown): ProformaInvoiceData {
  const baseBlank = createBlankPi();
  if (!raw || typeof raw !== 'object') return baseBlank;
  const candidate = raw as Partial<ProformaInvoiceData>;
  return {
    ...baseBlank,
    ...candidate,
    language: candidate.language || 'en',
    buyer: {
      ...baseBlank.buyer,
      ...(candidate.buyer || {}),
    },
    products:
      Array.isArray(candidate.products) && candidate.products.length > 0
        ? candidate.products
        : baseBlank.products,
    shipping: {
      ...baseBlank.shipping,
      ...(candidate.shipping || {}),
      paymentPlan: candidate.shipping?.paymentPlan || 'full_100',
      piValidityDays: candidate.shipping?.piValidityDays ?? 5,
    },
  };
}

export default function App() {
  const [piData, setPiData] = useState<ProformaInvoiceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PI_KEY);
      if (saved) {
        return hydratePiDraft(JSON.parse(saved));
      }
    } catch {
      // ignore invalid storage
    }
    return createBlankPi();
  });

  const [sellerInfo, setSellerInfo] = useState<SellerInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPANY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { seller?: SellerInfo };
        if (parsed.seller) return parsed.seller;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SELLER_INFO;
  });

  const [bankInfo, setBankInfo] = useState<BankInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPANY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { bank?: BankInfo };
        if (parsed.bank) return parsed.bank;
      }
    } catch {
      // ignore
    }
    return DEFAULT_BANK_INFO;
  });

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [showAdvancedTerms, setShowAdvancedTerms] = useState(false);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [fitScale, setFitScale] = useState(0.78);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedWords, setCopiedWords] = useState(false);

  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const exportSheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PI_KEY, JSON.stringify(piData));
    } catch {
      // ignore
    }
  }, [piData]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_COMPANY_KEY,
        JSON.stringify({ seller: sellerInfo, bank: bankInfo })
      );
    } catch {
      // ignore
    }
  }, [sellerInfo, bankInfo]);

  useEffect(() => {
    const updateScale = () => {
      const container = previewViewportRef.current;
      if (!container) return;
      const availableWidth = container.clientWidth - 48;
      const a4PixelWidth = 794;
      const computed = Math.min(1, Math.max(0.42, availableWidth / a4PixelWidth));
      setFitScale(Number(computed.toFixed(3)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewViewportRef.current) {
      observer.observe(previewViewportRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const activeScale = zoomMode === 'fit' ? fitScale : zoomMode === '75' ? 0.75 : 1;

  // Derived Totals & Trilingual Uppercase Words
  const totalAmount = useMemo(() => {
    return piData.products.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [piData.products]);

  const totalWords = useMemo(
    () => numberToUsdWords(totalAmount, piData.language),
    [totalAmount, piData.language]
  );

  const effectiveDepositPct =
    piData.shipping.paymentPlan === 'full_100'
      ? 100
      : piData.shipping.paymentPlan === 'deposit_30_70'
        ? 30
        : piData.shipping.paymentPercent;

  const paymentSplit = useMemo(
    () => calculateSplitAmounts(totalAmount, effectiveDepositPct),
    [totalAmount, effectiveDepositPct]
  );

  const inferredPreview = useMemo(
    () =>
      inferShipping({
        originPort: piData.shipping.originPort,
        destinationPort: piData.shipping.destinationPort,
        buyerAddress: piData.buyer.address,
        buyerName: piData.buyer.name,
        preferredMode: piData.autoMatchShipping ? undefined : piData.shipping.modeKey,
        lang: piData.language,
      }),
    [
      piData.shipping.originPort,
      piData.shipping.destinationPort,
      piData.buyer.address,
      piData.buyer.name,
      piData.autoMatchShipping,
      piData.shipping.modeKey,
      piData.language,
    ]
  );

  // Switch document language (EN / FR / ES)
  const handleLanguageChange = (nextLang: PiLanguage) => {
    setPiData((prev) => {
      const preset = SHIPMENT_MODES[prev.shipping.modeKey];
      return {
        ...prev,
        language: nextLang,
        shipping: {
          ...prev.shipping,
          modeOfShipment: preset.modeText[nextLang],
          timeOfShipment: preset.defaultTimeOfShipment[nextLang],
        },
      };
    });
  };

  // Buyer field change: triggers auto shipping inference if enabled
  const updateBuyerField = (field: 'name' | 'address' | 'tel', value: string) => {
    setPiData((prev) => {
      const nextBuyer = { ...prev.buyer, [field]: value };
      if (!prev.autoMatchShipping) {
        return { ...prev, buyer: nextBuyer };
      }
      const inferred = inferShipping({
        originPort: prev.shipping.originPort,
        destinationPort: prev.shipping.destinationPort,
        buyerAddress: nextBuyer.address,
        buyerName: nextBuyer.name,
        lang: prev.language,
      });
      return {
        ...prev,
        buyer: nextBuyer,
        shipping: {
          ...prev.shipping,
          originPort: inferred.originPort,
          destinationPort: prev.shipping.destinationPort || inferred.destinationPort,
          transportRoute: inferred.transportRoute,
          modeKey: inferred.modeKey,
          modeOfShipment: inferred.modeOfShipment,
          timeOfShipment: inferred.timeOfShipment,
        },
      };
    });
  };

  // Port field change: automatically builds route & recognizes shipment mode
  const handlePortChange = (field: 'originPort' | 'destinationPort', value: string) => {
    setPiData((prev) => {
      const nextOrigin = field === 'originPort' ? value : prev.shipping.originPort;
      const nextDest = field === 'destinationPort' ? value : prev.shipping.destinationPort;

      const inferred = inferShipping({
        originPort: nextOrigin,
        destinationPort: nextDest,
        buyerAddress: prev.buyer.address,
        buyerName: prev.buyer.name,
        lang: prev.language,
      });

      return {
        ...prev,
        autoMatchShipping: true,
        shipping: {
          ...prev.shipping,
          originPort: nextOrigin,
          destinationPort: nextDest,
          transportRoute: buildTransportRoute(
            nextOrigin || inferred.originPort,
            nextDest || inferred.destinationPort
          ),
          modeKey: inferred.modeKey,
          modeOfShipment: inferred.modeOfShipment,
          timeOfShipment: inferred.timeOfShipment,
        },
      };
    });
  };

  const handleModeSwitch = (modeKey: ShipmentModeKey) => {
    setPiData((prev) => {
      const preset = SHIPMENT_MODES[modeKey];
      const nextOrigin = prev.shipping.originPort.trim()
        ? prev.shipping.originPort
        : preset.defaultOrigin;
      const inferred = inferShipping({
        originPort: nextOrigin,
        destinationPort: prev.shipping.destinationPort,
        buyerAddress: prev.buyer.address,
        buyerName: prev.buyer.name,
        preferredMode: modeKey,
        lang: prev.language,
      });
      return {
        ...prev,
        shipping: {
          ...prev.shipping,
          originPort: inferred.originPort,
          modeKey,
          modeOfShipment: preset.modeText[prev.language],
          transportRoute: inferred.transportRoute,
          timeOfShipment: preset.defaultTimeOfShipment[prev.language],
        },
      };
    });
  };

  const handleReAutoMatch = () => {
    setPiData((prev) => {
      const inferred = inferShipping({
        originPort: prev.shipping.originPort,
        destinationPort: prev.shipping.destinationPort,
        buyerAddress: prev.buyer.address,
        buyerName: prev.buyer.name,
        lang: prev.language,
      });
      return {
        ...prev,
        autoMatchShipping: true,
        shipping: {
          ...prev.shipping,
          originPort: inferred.originPort,
          destinationPort: prev.shipping.destinationPort || inferred.destinationPort,
          transportRoute: inferred.transportRoute,
          modeKey: inferred.modeKey,
          modeOfShipment: inferred.modeOfShipment,
          timeOfShipment: inferred.timeOfShipment,
        },
      };
    });
  };

  const handlePaymentPlanChange = (plan: PaymentPlanType) => {
    setPiData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        paymentPlan: plan,
        paymentPercent:
          plan === 'full_100'
            ? 100
            : plan === 'deposit_30_70'
              ? 30
              : prev.shipping.paymentPercent === 100
                ? 50
                : prev.shipping.paymentPercent,
      },
    }));
  };

  // Product Row Handlers
  const addProductRow = () => {
    const newItem: ProductItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      model: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setPiData((prev) => ({
      ...prev,
      products: [...prev.products, newItem],
    }));
  };

  const updateProductRow = (
    id: string,
    field: keyof Omit<ProductItem, 'id'>,
    value: string | number
  ) => {
    setPiData((prev) => ({
      ...prev,
      products: prev.products.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeProductRow = (id: string) => {
    setPiData((prev) => ({
      ...prev,
      products: prev.products.filter((item) => item.id !== id),
    }));
  };

  const handleRefreshPiNoAndDate = () => {
    const now = new Date();
    setPiData((prev) => ({
      ...prev,
      piNumber: generatePiNumber(now),
      date: formatPiDate(now),
    }));
  };

  const handleCreateBlank = () => {
    const currentLang = piData.language;
    const blank = createBlankPi();
    const preset = SHIPMENT_MODES[blank.shipping.modeKey];
    setPiData({
      ...blank,
      language: currentLang,
      shipping: {
        ...blank.shipping,
        modeOfShipment: preset.modeText[currentLang],
        timeOfShipment: preset.defaultTimeOfShipment[currentLang],
      },
    });
    setExportError(null);
  };

  const handleApplySmartImport = (
    parsed: SmartImportResult,
    options: { replaceProducts: boolean }
  ) => {
    setPiData((prev) => {
      const nextLang = parsed.language || prev.language;
      const nextBuyer = {
        name: parsed.buyerName ?? prev.buyer.name,
        address: parsed.buyerAddress ?? prev.buyer.address,
        tel: parsed.buyerTel ?? prev.buyer.tel,
      };

      const nextOrigin = parsed.originPort || prev.shipping.originPort;
      const nextDest = parsed.destinationPort || prev.shipping.destinationPort;

      const inferred = inferShipping({
        originPort: nextOrigin,
        destinationPort: nextDest,
        buyerAddress: nextBuyer.address,
        buyerName: nextBuyer.name,
        preferredMode: parsed.modeKey,
        lang: nextLang,
      });

      let nextProducts = prev.products;
      if (parsed.products.length > 0) {
        if (options.replaceProducts) {
          nextProducts = parsed.products;
        } else {
          const hasOnlyEmptyStarter =
            prev.products.length === 1 &&
            !prev.products[0].model &&
            !prev.products[0].description &&
            prev.products[0].unitPrice === 0;
          nextProducts = hasOnlyEmptyStarter
            ? parsed.products
            : [...prev.products, ...parsed.products];
        }
      }

      const nextPaymentPlan = parsed.paymentPlan || prev.shipping.paymentPlan;
      const nextPaymentPercent =
        nextPaymentPlan === 'full_100'
          ? 100
          : nextPaymentPlan === 'deposit_30_70'
            ? 30
            : parsed.paymentPercent ?? prev.shipping.paymentPercent;

      return {
        ...prev,
        language: nextLang,
        piNumber: parsed.piNumber || prev.piNumber,
        date: parsed.date || prev.date,
        buyer: nextBuyer,
        products: nextProducts,
        autoMatchShipping: true,
        shipping: {
          ...prev.shipping,
          originPort: inferred.originPort,
          destinationPort: inferred.destinationPort,
          transportRoute: inferred.transportRoute,
          modeKey: inferred.modeKey,
          modeOfShipment: inferred.modeOfShipment,
          timeOfShipment: inferred.timeOfShipment,
          paymentPlan: nextPaymentPlan,
          paymentPercent: nextPaymentPercent,
        },
      };
    });
    setExportError(null);
  };

  const getExportFileBaseName = () => {
    const rawName = (piData.buyer.name || '').trim() || (sellerInfo.name || '').trim() || '汇驰达';
    const sanitized = rawName.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
    return `${sanitized} PI`;
  };

  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = getExportFileBaseName();
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 300);
  };

  const handleCopyWords = async () => {
    try {
      await navigator.clipboard.writeText(`TOTAL: ${totalWords}`);
      setCopiedWords(true);
      setTimeout(() => setCopiedWords(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadPdf = async () => {
    const targetNode = exportSheetRef.current;
    if (!targetNode || isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(targetNode, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`${getExportFileBaseName()}.pdf`);
    } catch (err) {
      setExportError(
        err instanceof Error ? `PDF 导出失败：${err.message}` : 'PDF 导出失败，请重试或使用打印导出。'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F4F8] text-slate-900">
      {/* Top Bar: Strict 3-Zone Contract */}
      <header className="no-print h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-8 shrink-0">
        {/* Zone 1: Single-line Wordmark */}
        <a
          href="#top"
          onClick={(e) => e.preventDefault()}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          汇驰达PI报价
        </a>

        {/* Zone 2: Clean single-line utility links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={handleCreateBlank}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            新建报价单
          </button>
          <button
            type="button"
            onClick={() => setIsSmartImportOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            一键匹配导入
          </button>
          <button
            type="button"
            onClick={() => setIsCompanyModalOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            公司与银行信息
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            打印预览
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? '正在生成 PDF...' : '下载 PDF 报价单'}
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Pane: Focused PI Form */}
        <aside className="no-print w-full lg:w-[500px] xl:w-[540px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {/* Mobile Quick Actions Strip */}
          <div className="flex md:hidden items-center gap-3 px-5 py-2.5 border-b border-slate-200 text-xs font-medium text-slate-600 overflow-x-auto">
            <button
              type="button"
              onClick={handleCreateBlank}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-slate-900"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              新建
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => setIsSmartImportOpen(true)}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-slate-900"
            >
              <Sparkles className="w-3.5 h-3.5" />
              匹配导入
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => setIsCompanyModalOpen(true)}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-slate-900"
            >
              <Building2 className="w-3.5 h-3.5" />
              公司信息
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-slate-900"
            >
              <Printer className="w-3.5 h-3.5" />
              打印
            </button>
          </div>

          {exportError && (
            <div className="mx-5 mt-4 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {exportError}
            </div>
          )}

          {/* Language Selector Bar */}
          <section className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                报价单语言版本 (PI Language)
              </span>
              <span className="text-[11px] text-slate-500">
                自动切换标题、条款及大写金额语种
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-md">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = piData.language === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleLanguageChange(opt.id)}
                    className={`py-2 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 01: PI Header & Buyer Info */}
          <section className="px-6 py-5 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                01. 单据编号与客户信息
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSmartImportOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  一键匹配导入
                </button>
                <button
                  type="button"
                  onClick={handleRefreshPiNoAndDate}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="按今日日期更新编号与日期"
                >
                  <RotateCcw className="w-3 h-3" />
                  按今日更新
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  报价单编号 (No.)
                </label>
                <input
                  type="text"
                  value={piData.piNumber}
                  onChange={(e) => setPiData({ ...piData, piNumber: e.target.value })}
                  placeholder="HYZY-YT-261114"
                  className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  日期 (Date)
                </label>
                <input
                  type="text"
                  value={piData.date}
                  onChange={(e) => setPiData({ ...piData, date: e.target.value })}
                  placeholder="2026/11/14"
                  className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                客户名称 / 公司 (Buyer)
              </label>
              <input
                type="text"
                value={piData.buyer.name}
                onChange={(e) => updateBuyerField('name', e.target.value)}
                placeholder="例如：ESTA ES MI EMPRESA AMIGO"
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-600">
                  客户地址 (Add)
                </label>
                <span className="text-[11px] text-slate-400">
                  支持自动识别目的国与港口
                </span>
              </div>
              <textarea
                rows={2}
                value={piData.buyer.address}
                onChange={(e) => updateBuyerField('address', e.target.value)}
                placeholder="例如：Jr los mangos 340&#10;Ucayali Coronel Portillo manantay, Peru"
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                客户电话 (Tel)
              </label>
              <input
                type="text"
                value={piData.buyer.tel}
                onChange={(e) => updateBuyerField('tel', e.target.value)}
                placeholder="例如：051-920665609"
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
          </section>

          {/* Section 02: Products & Auto Total Words */}
          <section className="px-6 py-5 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                02. 产品信息、数量与单价
              </h2>
              <button
                type="button"
                onClick={addProductRow}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                添加产品
              </button>
            </div>

            <div className="space-y-3">
              {piData.products.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-700">产品 #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tabular text-slate-900 font-semibold">
                          小计 {formatUsd(lineTotal)}
                        </span>
                        {piData.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductRow(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            aria-label={`删除产品 ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          型号 / 品牌 (Model)
                        </label>
                        <input
                          type="text"
                          value={item.model}
                          onChange={(e) => updateProductRow(item.id, 'model', e.target.value)}
                          placeholder="Jetour"
                          className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          数量 (Qty)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateProductRow(
                              item.id,
                              'quantity',
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-sm font-mono-tabular bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          单价 USD (Unit Price)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateProductRow(
                              item.id,
                              'unitPrice',
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-sm font-mono-tabular bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        产品描述与配置 (Description &amp; Specification)
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          updateProductRow(item.id, 'description', e.target.value)
                        }
                        placeholder="Jetour 2025 Montaña y Mar T1 C-DM 1.5T 150km Exploración Automático"
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900 resize-y"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Automatic Uppercase Words Readout */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  自动生成大写金额 (
                  {piData.language === 'en'
                    ? 'English'
                    : piData.language === 'fr'
                      ? 'Français'
                      : 'Español'}
                  )
                </span>
                <span className="font-mono-tabular text-sm font-bold text-slate-900">
                  {formatUsd(totalAmount)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 px-3 py-2.5 bg-slate-900 text-white rounded-md">
                <p className="text-xs font-mono-tabular leading-relaxed tracking-wide break-words">
                  TOTAL: {totalWords}
                </p>
                <button
                  type="button"
                  onClick={handleCopyWords}
                  className="p-1 text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
                  title="复制大写金额"
                >
                  {copiedWords ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Section 03: Ports, Auto Shipping & Payment Plan */}
          <section className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                03. 港口位置、运输方式与付款方案
              </h2>
              <button
                type="button"
                onClick={handleReAutoMatch}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重新自动识别
              </button>
            </div>

            {/* Dedicated Port Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  起运港口 / 口岸 (Origin Port)
                </label>
                <input
                  type="text"
                  list="origin-port-presets"
                  value={piData.shipping.originPort}
                  onChange={(e) => handlePortChange('originPort', e.target.value)}
                  placeholder="Nansha Port, Guangzhou, China"
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900"
                />
                <datalist id="origin-port-presets">
                  {ORIGIN_PORT_PRESETS.map((port) => (
                    <option key={port} value={port} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  目的港口 / 城市 (Destination Port)
                </label>
                <input
                  type="text"
                  value={piData.shipping.destinationPort}
                  onChange={(e) => handlePortChange('destinationPort', e.target.value)}
                  placeholder="输入港口或城市，如 Callao / Toamasina / Almaty"
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>自动识别：{inferredPreview.matchedLabel}</span>
              <label className="inline-flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={piData.autoMatchShipping}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      handleReAutoMatch();
                    } else {
                      setPiData({ ...piData, autoMatchShipping: false });
                    }
                  }}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                随港口/地址自动匹配
              </label>
            </div>

            {/* Segmented Mode Selector */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-md">
              {(Object.keys(SHIPMENT_MODES) as ShipmentModeKey[]).map((key) => {
                const active = piData.shipping.modeKey === key;
                const shortLabels: Record<ShipmentModeKey, string> = {
                  sea: '海运',
                  land: '陆运',
                  rail: '铁运',
                  air: '空运',
                  multimodal: '海铁',
                };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleModeSwitch(key)}
                    className={`py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {shortLabels[key]}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                3.1 运输路线 (Transport Route)
              </label>
              <input
                type="text"
                value={piData.shipping.transportRoute}
                onChange={(e) =>
                  setPiData({
                    ...piData,
                    autoMatchShipping: false,
                    shipping: { ...piData.shipping, transportRoute: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                3.2 运输方式 (Mode of shipment)
              </label>
              <input
                type="text"
                value={piData.shipping.modeOfShipment}
                onChange={(e) =>
                  setPiData({
                    ...piData,
                    autoMatchShipping: false,
                    shipping: { ...piData.shipping, modeOfShipment: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Payment Plan Selector (100% vs 30% Deposit + 70% Balance vs Custom) */}
            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                2. 付款方案 (Payment Terms)
              </label>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePaymentPlanChange('full_100')}
                  className={`flex items-center justify-between px-3 py-2 text-left text-xs rounded-md border transition-colors cursor-pointer ${
                    piData.shipping.paymentPlan === 'full_100'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">方案一：100% 全款 T/T 预付</span>
                  <span className="font-mono-tabular opacity-90">{formatUsd(totalAmount)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentPlanChange('deposit_30_70')}
                  className={`flex items-center justify-between px-3 py-2 text-left text-xs rounded-md border transition-colors cursor-pointer ${
                    piData.shipping.paymentPlan === 'deposit_30_70'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">
                    方案二：30% 定金 + 完成车辆转移出口手续后付 70% 尾款
                  </span>
                  <span className="font-mono-tabular opacity-90">30% / 70%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentPlanChange('custom_split')}
                  className={`flex items-center justify-between px-3 py-2 text-left text-xs rounded-md border transition-colors cursor-pointer ${
                    piData.shipping.paymentPlan === 'custom_split'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">方案三：自定义定金比例 + 转移出口手续后付尾款</span>
                  <span className="font-mono-tabular opacity-90">
                    {piData.shipping.paymentPlan === 'custom_split'
                      ? `${paymentSplit.depositPercent}% / ${paymentSplit.balancePercent}%`
                      : '自定义'}
                  </span>
                </button>
              </div>

              {piData.shipping.paymentPlan === 'custom_split' && (
                <div className="flex items-center gap-3 pt-1">
                  <label className="text-xs text-slate-600 shrink-0">定金比例 (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={piData.shipping.paymentPercent}
                    onChange={(e) =>
                      setPiData({
                        ...piData,
                        shipping: {
                          ...piData.shipping,
                          paymentPercent: Math.min(99, Math.max(1, Number(e.target.value) || 30)),
                        },
                      })
                    }
                    className="w-24 px-2.5 py-1.5 text-sm font-mono-tabular bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-mono-tabular">
                    尾款 {paymentSplit.balancePercent}%
                  </span>
                </div>
              )}

              {/* Calculated Breakdown Table for Split Payments */}
              {piData.shipping.paymentPlan !== 'full_100' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
                  <div>
                    <div className="text-slate-500">合同总价</div>
                    <div className="font-mono-tabular font-semibold text-slate-900 mt-0.5">
                      {formatUsd(paymentSplit.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">
                      定金 ({paymentSplit.depositPercent}%)
                    </div>
                    <div className="font-mono-tabular font-semibold text-slate-900 mt-0.5">
                      {formatUsd(paymentSplit.depositAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">
                      出口手续后尾款 ({paymentSplit.balancePercent}%)
                    </div>
                    <div className="font-mono-tabular font-semibold text-slate-900 mt-0.5">
                      {formatUsd(paymentSplit.balanceAmount)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seal Toggle + Expandable Terms */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={piData.showSeal}
                  onChange={(e) => setPiData({ ...piData, showSeal: e.target.checked })}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                加盖湖北易通公司红色公章
              </label>

              <button
                type="button"
                onClick={() => setShowAdvancedTerms((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                船期与有效期设置
                {showAdvancedTerms ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {showAdvancedTerms && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      付款方式
                    </label>
                    <input
                      type="text"
                      value={piData.shipping.paymentMethod}
                      onChange={(e) =>
                        setPiData({
                          ...piData,
                          shipping: { ...piData.shipping, paymentMethod: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-sm bg-slate-50/60 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      4 有效期天数 (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={piData.shipping.piValidityDays}
                      onChange={(e) =>
                        setPiData({
                          ...piData,
                          shipping: {
                            ...piData.shipping,
                            piValidityDays: Math.max(1, Number(e.target.value) || 5),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-sm font-mono-tabular bg-slate-50/60 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    3.3 船期条款 (Time of shipment)
                  </label>
                  <textarea
                    rows={2}
                    value={piData.shipping.timeOfShipment}
                    onChange={(e) =>
                      setPiData({
                        ...piData,
                        shipping: { ...piData.shipping, timeOfShipment: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50/60 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      3.4 分批装运 (Partial shipment)
                    </label>
                    <select
                      value={piData.shipping.partialShipment}
                      onChange={(e) =>
                        setPiData({
                          ...piData,
                          shipping: {
                            ...piData.shipping,
                            partialShipment: e.target.value as 'ALLOWED' | 'NOT ALLOWED',
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50/60 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                    >
                      <option value="ALLOWED">ALLOWED</option>
                      <option value="NOT ALLOWED">NOT ALLOWED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      3.5 转运 (Transshipment)
                    </label>
                    <select
                      value={piData.shipping.transshipment}
                      onChange={(e) =>
                        setPiData({
                          ...piData,
                          shipping: {
                            ...piData.shipping,
                            transshipment: e.target.value as 'ALLOWED' | 'NOT ALLOWED',
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50/60 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-slate-900"
                    >
                      <option value="ALLOWED">ALLOWED</option>
                      <option value="NOT ALLOWED">NOT ALLOWED</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>
        </aside>

        {/* Right Pane: Live A4 Document Preview */}
        <main
          ref={previewViewportRef}
          className="flex-1 bg-[#E8ECF2] lg:h-[calc(100vh-3.5rem)] overflow-auto flex flex-col items-center py-6 px-4 sm:px-6"
        >
          {/* Preview Toolbar */}
          <div className="no-print w-full max-w-[794px] flex items-center justify-between mb-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">A4 正式报价单预览</span>
              <span aria-hidden="true">·</span>
              <span>
                {piData.language === 'en'
                  ? 'English'
                  : piData.language === 'fr'
                    ? 'Français'
                    : 'Español'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">210 × 297 mm</span>
              <span aria-hidden="true">·</span>
              <span>{piData.showSeal ? '已盖章' : '未盖章'}</span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-md">
              {(
                [
                  { id: 'fit', label: '适应' },
                  { id: '75', label: '75%' },
                  { id: '100', label: '100%' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setZoomMode(opt.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    zoomMode === opt.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scaled Live A4 Paper Container */}
          <div
            className="flex justify-center"
            style={{
              width: `calc(210mm * ${activeScale})`,
              minHeight: `calc(297mm * ${activeScale})`,
            }}
          >
            <div
              style={{
                transform: `scale(${activeScale})`,
                transformOrigin: 'top center',
                width: '210mm',
              }}
              className="shadow-[0_6px_28px_rgba(15,23,42,0.12)]"
            >
              <ProformaInvoiceSheet
                data={piData}
                seller={sellerInfo}
                bank={bankInfo}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Hidden Full-Scale Offscreen Sheet for Crisp 3x PDF Export */}
      <div
        aria-hidden="true"
        className="no-print"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '210mm',
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <ProformaInvoiceSheet
          sheetRef={exportSheetRef}
          data={piData}
          seller={sellerInfo}
          bank={bankInfo}
        />
      </div>

      {/* Company & Bank Info Modal */}
      {isCompanyModalOpen && (
        <CompanyInfoModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          seller={sellerInfo}
          bank={bankInfo}
          onSave={(newSeller, newBank) => {
            setSellerInfo(newSeller);
            setBankInfo(newBank);
          }}
        />
      )}

      {/* One-Click Smart Import Modal */}
      {isSmartImportOpen && (
        <SmartImportModal
          isOpen={isSmartImportOpen}
          onClose={() => setIsSmartImportOpen(false)}
          onApply={handleApplySmartImport}
        />
      )}
    </div>
  );
}
