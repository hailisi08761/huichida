import React from 'react';
import { BankInfo, ProformaInvoiceData, SellerInfo } from '../types/pi';
import {
  calculateSplitAmounts,
  formatContractUsd,
  formatUsd,
  numberToUsdWords,
} from '../utils/numberToWords';
import { PI_TRANSLATIONS } from '../utils/piTranslations';
import { CompanySeal } from './CompanySeal';

interface ProformaInvoiceSheetProps {
  data: ProformaInvoiceData;
  seller: SellerInfo;
  bank: BankInfo;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}

export const ProformaInvoiceSheet: React.FC<ProformaInvoiceSheetProps> = ({
  data,
  seller,
  bank,
  sheetRef,
}) => {
  const lang = data.language || 'en';
  const copy = PI_TRANSLATIONS[lang];

  const totalAmount = data.products.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const totalInWords = numberToUsdWords(totalAmount, lang);

  const effectiveDepositPct =
    data.shipping.paymentPlan === 'full_100'
      ? 100
      : data.shipping.paymentPlan === 'deposit_30_70'
        ? 30
        : data.shipping.paymentPercent;

  const { depositAmount, balanceAmount, depositPercent, balancePercent } = calculateSplitAmounts(
    totalAmount,
    effectiveDepositPct
  );

  const clause2Text =
    data.shipping.paymentPlan === 'full_100'
      ? copy.buildFullPaymentClause({
          percent: 100,
          totalStr: formatContractUsd(totalAmount),
          payAmountStr: formatContractUsd(totalAmount),
          method: data.shipping.paymentMethod,
          daysText: data.shipping.paymentDaysText,
        })
      : copy.buildSplitPaymentClause({
          depositPct: depositPercent,
          balancePct: balancePercent,
          totalStr: formatContractUsd(totalAmount),
          depositStr: formatContractUsd(depositAmount),
          balanceStr: formatContractUsd(balanceAmount),
          method: data.shipping.paymentMethod,
          daysText: data.shipping.paymentDaysText,
        });

  const partialShipmentText =
    data.shipping.partialShipment === 'ALLOWED' ? copy.allowed : copy.notAllowed;
  const transshipmentText =
    data.shipping.transshipment === 'ALLOWED' ? copy.allowed : copy.notAllowed;
  const validityText = `${data.shipping.piValidityDays ?? 5} ${copy.daysUnit}`;

  return (
    <div
      ref={sheetRef}
      className="print-only-sheet pi-document-font bg-[#ffffff] text-[#000000] select-text"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 18mm 16mm 18mm',
        boxSizing: 'border-box',
        fontSize: '10.5pt',
        lineHeight: 1.42,
        position: 'relative',
      }}
    >
      {/* Document Title */}
      <h1
        style={{
          textAlign: 'center',
          fontSize: '16.5pt',
          fontWeight: 700,
          letterSpacing: '0.03em',
          marginBottom: '18px',
          color: '#000000',
        }}
      >
        {copy.title}
      </h1>

      {/* Top Metadata & Bank Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.08fr 0.92fr',
          columnGap: '14px',
          alignItems: 'start',
          marginBottom: '12px',
          fontSize: '9.5pt',
          lineHeight: 1.38,
        }}
      >
        {/* Left Column: Buyer & Seller */}
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              <col style={{ width: lang === 'en' ? '56px' : '82px' }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.buyerLabel}</td>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                  {data.buyer.name || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.addressLabel}</td>
                <td
                  style={{
                    paddingBottom: '10px',
                    verticalAlign: 'top',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                  }}
                >
                  {data.buyer.address || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '12px', verticalAlign: 'top' }}>{copy.telLabel}</td>
                <td style={{ paddingBottom: '12px', verticalAlign: 'top' }}>
                  {data.buyer.tel || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.sellerLabel}</td>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                  {seller.name}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.addressLabel}</td>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                  {seller.address}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '4px', verticalAlign: 'top' }}>{copy.telLabel}</td>
                <td style={{ paddingBottom: '4px', verticalAlign: 'top' }}>{seller.tel}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: PI No, Date, Signed At, Bank Box */}
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '10px',
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              <col style={{ width: lang === 'en' ? '100px' : '116px' }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.piNoLabel}</td>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                  {data.piNumber}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{copy.dateLabel}</td>
                <td style={{ paddingBottom: '10px', verticalAlign: 'top' }}>{data.date}</td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '2px', verticalAlign: 'top' }}>{copy.signedAtLabel}</td>
                <td style={{ paddingBottom: '2px', verticalAlign: 'top' }}>{seller.signedAt}</td>
              </tr>
            </tbody>
          </table>

          {/* Boxed Bank Details */}
          <div
            style={{
              border: '1px solid #000000',
              padding: '6px 7px',
              fontSize: '8.7pt',
              lineHeight: 1.32,
              wordBreak: 'break-word',
            }}
          >
            <div style={{ marginBottom: '6px' }}>{copy.bankHeader}</div>
            <div>
              {copy.beneficiaryName}
              {bank.beneficiaryName}
            </div>
            <div>
              {copy.beneficiaryAccount}
              {bank.beneficiaryAccountNumber}
            </div>
            <div>
              {copy.swiftCode}
              {bank.swiftCode}
            </div>
            <div>
              {copy.countryRegion}
              {bank.countryRegion}
            </div>
            <div>
              {copy.beneficiaryAddress}
              {bank.beneficiaryAddress}
            </div>
            <div>
              {copy.beneficiaryBank}
              {bank.beneficiaryBank}
            </div>
            <div>
              {copy.beneficiaryBankAddress}
              {bank.beneficiaryBankAddress}
            </div>
            <div>
              {copy.bankCode}
              {bank.bankCode}
            </div>
            <div>
              {copy.branchCode}
              {bank.branchCode}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Intro */}
      <p
        style={{
          fontSize: '9.5pt',
          marginTop: '6px',
          marginBottom: '4px',
          color: '#000000',
        }}
      >
        {copy.contractIntro}
      </p>

      {/* Main Contract Table (Clause 1 + Products + Total + Clause 2) */}
      <div style={{ display: 'flex', alignItems: 'stretch', width: '100%' }}>
        {/* Left Margin Clause Numbers Column */}
        <div
          style={{
            width: '14px',
            flexShrink: 0,
            fontSize: '9.5pt',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ paddingTop: '2px' }}>1</span>
        </div>

        {/* Boxed Table */}
        <div style={{ flex: 1 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              fontSize: '9.2pt',
              border: '1px solid #000000',
            }}
          >
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '43%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 5px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                >
                  {copy.colModel}
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 5px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                >
                  {copy.colDescription}
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 5px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                >
                  {copy.colQuantity}
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 5px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                >
                  {copy.colUnitPrice}
                </th>
                <th
                  style={{
                    border: '1px solid #000000',
                    padding: '6px 5px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                >
                  {copy.colTotalAmount}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: '1px solid #000000',
                      padding: '14px 8px',
                      textAlign: 'center',
                      color: '#666666',
                    }}
                  >
                    {copy.noGoods}
                  </td>
                </tr>
              ) : (
                data.products.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const unit = Number(item.unitPrice) || 0;
                  const lineTotal = qty * unit;
                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '7px 6px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.model || '—'}
                      </td>
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '7px 6px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.description || '—'}
                      </td>
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '7px 5px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {qty}
                      </td>
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '7px 5px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {formatUsd(unit)}
                      </td>
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '7px 5px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {formatUsd(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Total in Words Row */}
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: '1px solid #000000',
                    padding: '7px 8px',
                    fontWeight: 700,
                    fontSize: '9.6pt',
                    textAlign: 'left',
                    wordBreak: 'break-word',
                  }}
                >
                  {copy.totalPrefix} {totalInWords}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Clause 2 Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: '-14px' }}>
            <div
              style={{
                width: '14px',
                flexShrink: 0,
                fontSize: '9.5pt',
                fontWeight: 700,
                paddingTop: '4px',
              }}
            >
              2
            </div>
            <div
              style={{
                flex: 1,
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '10px 8px',
                fontSize: '9.1pt',
                fontWeight: 700,
                lineHeight: 1.38,
              }}
            >
              {clause2Text}
            </div>
          </div>
        </div>
      </div>

      {/* Clauses 3 & 4 + Overlapping Official Seal */}
      <div
        style={{
          position: 'relative',
          marginTop: '10px',
          paddingLeft: '4px',
          fontSize: '9.1pt',
          lineHeight: 1.55,
          minHeight: '160px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '28px' }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>3.1</td>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>
                {copy.transportRouteLabel} {data.shipping.transportRoute}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>3.2</td>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>
                {copy.modeOfShipmentLabel}
                {data.shipping.modeOfShipment}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '3px' }}>3.3</td>
              <td style={{ verticalAlign: 'top', paddingBottom: '3px' }}>
                <strong>{copy.timeOfShipmentLabel}</strong> {data.shipping.timeOfShipment}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>3.4</td>
              <td style={{ verticalAlign: 'top', paddingBottom: '2px' }}>
                <strong>{copy.partialShipmentLabel}</strong> {partialShipmentText}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingBottom: '2px' }}>3.5</td>
              <td style={{ verticalAlign: 'top', paddingBottom: '2px' }}>
                <strong>{copy.transshipmentLabel}</strong> {transshipmentText}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: 'top', paddingTop: '2px' }}>4</td>
              <td style={{ verticalAlign: 'top', paddingTop: '2px' }}>
                <strong>{copy.piValidityLabel}</strong> {validityText}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Exact Official Red Seal Image (image_f7b9f8c3.png) */}
        {data.showSeal && (
          <div
            style={{
              position: 'absolute',
              right: '58px',
              top: '18px',
              width: '134px',
              height: '134px',
              pointerEvents: 'none',
            }}
          >
            <CompanySeal className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
};
