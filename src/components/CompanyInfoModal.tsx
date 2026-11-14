import React, { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { BankInfo, SellerInfo } from '../types/pi';
import { DEFAULT_BANK_INFO, DEFAULT_SELLER_INFO } from '../data/companyDefaults';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerInfo;
  bank: BankInfo;
  onSave: (seller: SellerInfo, bank: BankInfo) => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  isOpen,
  onClose,
  seller,
  bank,
  onSave,
}) => {
  const [draftSeller, setDraftSeller] = useState<SellerInfo>(seller);
  const [draftBank, setDraftBank] = useState<BankInfo>(bank);

  if (!isOpen) return null;

  const handleRestoreDefaults = () => {
    setDraftSeller(DEFAULT_SELLER_INFO);
    setDraftBank(DEFAULT_BANK_INFO);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draftSeller, draftBank);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="company-modal-title" className="text-base font-semibold text-slate-900">
              卖方公司与开户行信息 (Seller &amp; Bank)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              默认已锁定为您现有 PI 方案中的湖北易通公司信息与香港花旗银行账户
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="关闭窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Seller Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 tracking-wide">
              卖方信息 (Seller)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seller Name
                </label>
                <input
                  type="text"
                  value={draftSeller.name}
                  onChange={(e) => setDraftSeller({ ...draftSeller, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seller Address
                </label>
                <textarea
                  rows={2}
                  value={draftSeller.address}
                  onChange={(e) => setDraftSeller({ ...draftSeller, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tel</label>
                <input
                  type="text"
                  value={draftSeller.tel}
                  onChange={(e) => setDraftSeller({ ...draftSeller, tel: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Signed at
                </label>
                <input
                  type="text"
                  value={draftSeller.signedAt}
                  onChange={(e) => setDraftSeller({ ...draftSeller, signedAt: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Bank Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 tracking-wide">
              开户行信息 (Bank Account)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={draftBank.beneficiaryName}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, beneficiaryName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Beneficiary Account Number
                </label>
                <input
                  type="text"
                  value={draftBank.beneficiaryAccountNumber}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, beneficiaryAccountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Swift Code
                </label>
                <input
                  type="text"
                  value={draftBank.swiftCode}
                  onChange={(e) => setDraftBank({ ...draftBank, swiftCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Country/Region
                </label>
                <input
                  type="text"
                  value={draftBank.countryRegion}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, countryRegion: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Bank Code
                  </label>
                  <input
                    type="text"
                    value={draftBank.bankCode}
                    onChange={(e) => setDraftBank({ ...draftBank, bankCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={draftBank.branchCode}
                    onChange={(e) => setDraftBank({ ...draftBank, branchCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Beneficiary Address
                </label>
                <input
                  type="text"
                  value={draftBank.beneficiaryAddress}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, beneficiaryAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Beneficiary Bank
                </label>
                <input
                  type="text"
                  value={draftBank.beneficiaryBank}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, beneficiaryBank: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Beneficiary Bank Address
                </label>
                <input
                  type="text"
                  value={draftBank.beneficiaryBankAddress}
                  onChange={(e) =>
                    setDraftBank({ ...draftBank, beneficiaryBankAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              恢复默认方案信息
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                保存公司信息
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
