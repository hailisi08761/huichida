import React, { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardPaste, Sparkles, X } from 'lucide-react';
import { formatUsd } from '../utils/numberToWords';
import { parseSmartImportText, SmartImportResult } from '../utils/smartImportParser';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (parsed: SmartImportResult, options: { replaceProducts: boolean }) => void;
}

const EXAMPLE_PASTE_HINT = `客户：ESTA ES MI EMPRESA AMIGO
地址：Jr los mangos 340, Ucayali Coronel Portillo manantay, Peru
电话：051-920665609
起运港：Nansha Port, Guangzhou, China
目的港：Callao Port, Peru
产品：
1. Jetour 2025 Montaña y Mar T1 C-DM 1.5T 150km Exploración Automático | 1台 | $17,000
2. Hyundai Elantra 2026 model 1.SL CVT GLX Elite Edition | 1台 | $11,000
付款：30%定金，完成车辆转移出口手续后付70%尾款`;

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [rawText, setRawText] = useState('');
  const [replaceProducts, setReplaceProducts] = useState(true);

  const parsed = useMemo(() => parseSmartImportText(rawText), [rawText]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRawText(text);
    } catch {
      // Clipboard API permission might be denied; user can paste via Ctrl+V
    }
  };

  const handleApply = () => {
    if (parsed.matchedFieldsCount === 0) return;
    onApply(parsed, { replaceProducts });
    setRawText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-import-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="smart-import-title" className="text-base font-semibold text-slate-900">
              一键匹配导入 (Smart Import)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              直接粘贴微信/WhatsApp/邮件/Excel 中的完整客户与产品报价信息，自动拆解并填入对应位置
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="关闭窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                粘贴整段信息
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRawText(EXAMPLE_PASTE_HINT)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  查看格式参考
                </button>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  从剪贴板粘贴
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`在此粘贴整段客户及车辆/产品信息，例如：\n客户：...\n地址：...\n电话：...\n目的港：Callao Port, Peru\nJetour 2025 1.5T 1台 $17000\n30%定金，70%尾款`}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-900 font-sans leading-relaxed"
            />
          </div>

          {/* Live Recognition Preview */}
          <div className="border border-slate-200 rounded-md bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                实时识别结果预览
              </span>
              <span className="text-xs text-slate-500 font-mono-tabular">
                {parsed.matchedFieldsCount > 0
                  ? `已匹配 ${parsed.matchedFieldsCount} 项内容`
                  : '等待输入内容'}
              </span>
            </div>

            {parsed.matchedFieldsCount === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                输入或粘贴文本后，这里会实时显示匹配到的客户名称、地址、电话、港口及产品明细。
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {/* Buyer & Logistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white border border-slate-200 rounded p-3">
                  <div>
                    <span className="text-slate-400">客户名称：</span>
                    <span className="text-slate-900 font-medium">
                      {parsed.buyerName || '未识别'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">客户电话：</span>
                    <span className="text-slate-900 font-mono-tabular">
                      {parsed.buyerTel || '未识别'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">客户地址：</span>
                    <span className="text-slate-900 whitespace-pre-line">
                      {parsed.buyerAddress || '未识别'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">起运港：</span>
                    <span className="text-slate-900">
                      {parsed.originPort || '自动默认'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">目的港：</span>
                    <span className="text-slate-900">
                      {parsed.destinationPort || '未识别'}
                    </span>
                  </div>
                  {parsed.paymentPlan && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">付款方案：</span>
                      <span className="text-slate-900 font-medium">
                        {parsed.paymentPlan === 'deposit_30_70'
                          ? '30% 定金 + 完成车辆转移出口手续后付 70% 尾款'
                          : parsed.paymentPlan === 'full_100'
                            ? '100% 全款预付'
                            : `自定义 ${parsed.paymentPercent}% 定金`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Matched Products Table */}
                {parsed.products.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                          <th className="py-2 px-3 font-medium">型号 (Model)</th>
                          <th className="py-2 px-3 font-medium">配置描述 (Description)</th>
                          <th className="py-2 px-3 font-medium text-right">数量</th>
                          <th className="py-2 px-3 font-medium text-right">单价</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.products.map((p) => (
                          <tr key={p.id} className="border-b last:border-b-0 border-slate-100">
                            <td className="py-2 px-3 font-medium text-slate-900">
                              {p.model || '—'}
                            </td>
                            <td className="py-2 px-3 text-slate-700">{p.description || '—'}</td>
                            <td className="py-2 px-3 text-right font-mono-tabular">
                              {p.quantity}
                            </td>
                            <td className="py-2 px-3 text-right font-mono-tabular">
                              {formatUsd(p.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceProducts}
              onChange={(e) => setReplaceProducts(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            用识别到的产品替换当前产品列表（取消勾选则追加到末尾）
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={parsed.matchedFieldsCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              一键填入报价单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
