export type PiLanguage = 'en' | 'fr' | 'es';

export type PaymentPlanType = 'full_100' | 'deposit_30_70' | 'custom_split';

export interface BuyerInfo {
  name: string;
  address: string;
  tel: string;
}

export interface SellerInfo {
  name: string;
  address: string;
  tel: string;
  signedAt: string;
}

export interface BankInfo {
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  swiftCode: string;
  countryRegion: string;
  beneficiaryAddress: string;
  beneficiaryBank: string;
  beneficiaryBankAddress: string;
  bankCode: string;
  branchCode: string;
}

export interface ProductItem {
  id: string;
  model: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type ShipmentModeKey = 'sea' | 'land' | 'rail' | 'air' | 'multimodal';

export interface ShippingTerms {
  originPort: string;
  destinationPort: string;
  transportRoute: string;
  modeKey: ShipmentModeKey;
  modeOfShipment: string;
  timeOfShipment: string;
  partialShipment: 'ALLOWED' | 'NOT ALLOWED';
  transshipment: 'ALLOWED' | 'NOT ALLOWED';
  piValidityDays: number;
  paymentPlan: PaymentPlanType;
  paymentPercent: number;
  paymentMethod: string;
  paymentDaysText: string;
}

export interface ProformaInvoiceData {
  language: PiLanguage;
  piNumber: string;
  date: string;
  buyer: BuyerInfo;
  products: ProductItem[];
  shipping: ShippingTerms;
  autoMatchShipping: boolean;
  showSeal: boolean;
}
