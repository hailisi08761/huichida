import { BankInfo, ProformaInvoiceData, SellerInfo } from '../types/pi';

export const DEFAULT_SELLER_INFO: SellerInfo = {
  name: 'Hubei Yitong Automobile Import And Export Trading Co., Ltd.',
  address:
    'No. 202-3, 2nd Floor, Unit 1, Building 7, Yuexiu Hanyang Xinghui Yunjin, 333 Qingchuan Avenue, Hanyang District, Wuhan City, Hubei Province',
  tel: '+8616602736559',
  signedAt: 'Wuhan, China',
};

export const DEFAULT_BANK_INFO: BankInfo = {
  beneficiaryName: 'Hubei Yitong Automobile Import And Export Trading Co., Ltd.',
  beneficiaryAccountNumber: '3996000879031',
  swiftCode: 'CITIHKHX or CITIHKHXXXX',
  countryRegion: 'HongKong',
  beneficiaryAddress:
    '26/F., TOWER ONE, TIME SQUARE 1 MATHESON STREET CAUSEWAY BAY HK',
  beneficiaryBank: 'CITIBANK, N.A., HONG KONG BRANCH',
  beneficiaryBankAddress:
    'Champion Tower, Three Garden Road, Central, Hong Kong',
  bankCode: '006',
  branchCode: '391',
};

export function formatPiDate(dateObj = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function generatePiNumber(dateObj = new Date()): string {
  const yy = String(dateObj.getFullYear()).slice(-2);
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `HYZY-YT-${yy}${mm}${dd}`;
}

export const REFERENCE_SAMPLE_PI: ProformaInvoiceData = {
  language: 'en',
  piNumber: 'HYZY-YT-261114',
  date: '2026/11/14',
  buyer: {
    name: 'ESTA ES MI EMPRESA AMIGO',
    address: 'Jr los mangos 340\nUcayali Coronel Portillo manantay',
    tel: '051-920665609',
  },
  products: [
    {
      id: 'item-1',
      model: 'Jetour',
      description: 'Jetour 2025 Montaña y Mar T1 C-DM 1.5T 150km Exploración Automático',
      quantity: 1,
      unitPrice: 17000,
    },
    {
      id: 'item-2',
      model: 'Hyundai Elantra',
      description: '2026 model 1.SL CVT GLX Elite Edition',
      quantity: 1,
      unitPrice: 11000,
    },
  ],
  shipping: {
    originPort: 'Nansha Port, Guangzhou, China',
    destinationPort: 'Callao Port, Peru',
    transportRoute: 'Nansha Port, Guangzhou, China to Callao Port, Peru',
    modeKey: 'sea',
    modeOfShipment: 'By Sea海路运输',
    timeOfShipment:
      'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS TWO MONTHS AFTER THE COMPLETION OF DELIVERY',
    partialShipment: 'ALLOWED',
    transshipment: 'ALLOWED',
    piValidityDays: 5,
    paymentPlan: 'full_100',
    paymentPercent: 100,
    paymentMethod: 'T/T',
    paymentDaysText: 'two calendar days',
  },
  autoMatchShipping: true,
  showSeal: true,
};

export function createBlankPi(): ProformaInvoiceData {
  const now = new Date();
  return {
    language: 'en',
    piNumber: generatePiNumber(now),
    date: formatPiDate(now),
    buyer: {
      name: '',
      address: '',
      tel: '',
    },
    products: [
      {
        id: `item-${Date.now()}`,
        model: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ],
    shipping: {
      originPort: 'Nansha Port, Guangzhou, China',
      destinationPort: '',
      transportRoute: 'Nansha Port, Guangzhou, China to Buyer Designated Destination Port',
      modeKey: 'sea',
      modeOfShipment: 'By Sea海路运输',
      timeOfShipment:
        'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS TWO MONTHS AFTER THE COMPLETION OF DELIVERY',
      partialShipment: 'ALLOWED',
      transshipment: 'ALLOWED',
      piValidityDays: 5,
      paymentPlan: 'full_100',
      paymentPercent: 100,
      paymentMethod: 'T/T',
      paymentDaysText: 'two calendar days',
    },
    autoMatchShipping: true,
    showSeal: true,
  };
}
