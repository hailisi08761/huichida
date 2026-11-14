import { PiLanguage } from '../types/pi';

export interface PiDocumentCopy {
  title: string;
  buyerLabel: string;
  addressLabel: string;
  telLabel: string;
  sellerLabel: string;
  piNoLabel: string;
  dateLabel: string;
  signedAtLabel: string;
  bankHeader: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  swiftCode: string;
  countryRegion: string;
  beneficiaryAddress: string;
  beneficiaryBank: string;
  beneficiaryBankAddress: string;
  bankCode: string;
  branchCode: string;
  contractIntro: string;
  colModel: string;
  colDescription: string;
  colQuantity: string;
  colUnitPrice: string;
  colTotalAmount: string;
  noGoods: string;
  totalPrefix: string;
  transportRouteLabel: string;
  modeOfShipmentLabel: string;
  timeOfShipmentLabel: string;
  partialShipmentLabel: string;
  transshipmentLabel: string;
  piValidityLabel: string;
  allowed: string;
  notAllowed: string;
  daysUnit: string;
  buildFullPaymentClause: (args: {
    percent: number;
    totalStr: string;
    payAmountStr: string;
    method: string;
    daysText: string;
  }) => string;
  buildSplitPaymentClause: (args: {
    depositPct: number;
    balancePct: number;
    totalStr: string;
    depositStr: string;
    balanceStr: string;
    method: string;
    daysText: string;
  }) => string;
}

export const PI_TRANSLATIONS: Record<PiLanguage, PiDocumentCopy> = {
  en: {
    title: 'PROFORMA INVOICE',
    buyerLabel: 'Buyer：',
    addressLabel: 'Add:',
    telLabel: 'Tel：',
    sellerLabel: 'Seller:',
    piNoLabel: '编号No:',
    dateLabel: '日期Date:',
    signedAtLabel: '地点Signed at:',
    bankHeader: '开户行BANK：',
    beneficiaryName: 'Beneficiary Name：',
    beneficiaryAccount: 'Beneficiary Account Number：',
    swiftCode: 'Swift Code：',
    countryRegion: 'Country/Region：',
    beneficiaryAddress: 'Beneficiary Address：',
    beneficiaryBank: 'Beneficiary Bank：',
    beneficiaryBankAddress: 'Beneficiary Bank Address：',
    bankCode: 'Bank Code：',
    branchCode: 'Branch Code：',
    contractIntro:
      'The sellers agrees to sell and the buyer agrees to buy the undermentioned goods on the terms and conditions stated below:',
    colModel: 'Model',
    colDescription: 'Description&Specification of Goods',
    colQuantity: 'Quantity',
    colUnitPrice: 'Unit Price',
    colTotalAmount: 'Total Amount',
    noGoods: 'No goods specified',
    totalPrefix: 'TOTAL:',
    transportRouteLabel: '运输路线Transport Route:',
    modeOfShipmentLabel: '运输方式 Mode of shipment :',
    timeOfShipmentLabel: 'Time of shipment:',
    partialShipmentLabel: 'Partial shipment:',
    transshipmentLabel: 'Transshipment:',
    piValidityLabel: 'PI Validity:',
    allowed: 'ALLOWED',
    notAllowed: 'NOT ALLOWED',
    daysUnit: 'DAYS',
    buildFullPaymentClause: ({ percent, payAmountStr, method, daysText }) =>
      `The Buyer shall pay ${percent}% of the total contract amount (${payAmountStr}) via ${method} within ${daysText} after signing this contract. Seller will provide VIN photos and video after receiving payment.`,
    buildSplitPaymentClause: ({
      depositPct,
      balancePct,
      totalStr,
      depositStr,
      balanceStr,
      method,
      daysText,
    }) =>
      `The Buyer shall pay a ${depositPct}% deposit (${depositStr}) of the total contract amount (${totalStr}) via ${method} within ${daysText} after signing this contract. The remaining ${balancePct}% balance (${balanceStr}) shall be paid via ${method} upon completion of vehicle transfer and export clearance procedures. Seller will provide VIN photos, video, and export transfer documents accordingly.`,
  },

  fr: {
    title: 'FACTURE PROFORMA',
    buyerLabel: 'Acheteur：',
    addressLabel: 'Adresse :',
    telLabel: 'Tél：',
    sellerLabel: 'Vendeur :',
    piNoLabel: '编号N° :',
    dateLabel: '日期Date :',
    signedAtLabel: '地点Lieu :',
    bankHeader: '开户行BANQUE ：',
    beneficiaryName: 'Nom du bénéficiaire：',
    beneficiaryAccount: 'Numéro de compte：',
    swiftCode: 'Code SWIFT：',
    countryRegion: 'Pays/Région：',
    beneficiaryAddress: 'Adresse du bénéficiaire：',
    beneficiaryBank: 'Banque bénéficiaire：',
    beneficiaryBankAddress: 'Adresse de la banque：',
    bankCode: 'Code banque：',
    branchCode: 'Code guichet：',
    contractIntro:
      "Le vendeur accepte de vendre et l'acheteur accepte d'acheter les marchandises ci-dessous selon les termes et conditions énoncés ci-après :",
    colModel: 'Modèle',
    colDescription: 'Désignation et spécifications des marchandises',
    colQuantity: 'Quantité',
    colUnitPrice: 'Prix unitaire',
    colTotalAmount: 'Montant total',
    noGoods: 'Aucune marchandise spécifiée',
    totalPrefix: 'TOTAL :',
    transportRouteLabel: '运输路线 Itinéraire de transport :',
    modeOfShipmentLabel: "运输方式 Mode d'expédition :",
    timeOfShipmentLabel: "Délai d'expédition :",
    partialShipmentLabel: 'Expédition partielle :',
    transshipmentLabel: 'Transbordement :',
    piValidityLabel: 'Validité de la facture proforma :',
    allowed: 'AUTORISÉ',
    notAllowed: 'NON AUTORISÉ',
    daysUnit: 'JOURS',
    buildFullPaymentClause: ({ percent, payAmountStr, method }) =>
      `L'Acheteur devra payer ${percent}% du montant total du contrat (${payAmountStr}) par virement bancaire (${method}) dans un délai de deux jours calendaires après la signature du présent contrat. Le Vendeur fournira les photos et vidéos du numéro VIN après réception du paiement.`,
    buildSplitPaymentClause: ({
      depositPct,
      balancePct,
      totalStr,
      depositStr,
      balanceStr,
      method,
    }) =>
      `L'Acheteur devra verser un acompte de ${depositPct}% (${depositStr}) sur le montant total du contrat (${totalStr}) par virement (${method}) dans les deux jours calendaires suivant la signature du présent contrat. Le solde restant de ${balancePct}% (${balanceStr}) devra être réglé par ${method} après l'achèvement des formalités de transfert et d'exportation du véhicule. Le Vendeur fournira les photos et vidéos du numéro VIN ainsi que les documents de transfert d'exportation.`,
  },

  es: {
    title: 'FACTURA PROFORMA',
    buyerLabel: 'Comprador：',
    addressLabel: 'Dirección:',
    telLabel: 'Tel：',
    sellerLabel: 'Vendedor:',
    piNoLabel: '编号N.º:',
    dateLabel: '日期Fecha:',
    signedAtLabel: '地点Firmado en:',
    bankHeader: '开户行BANCO：',
    beneficiaryName: 'Nombre del beneficiario：',
    beneficiaryAccount: 'Número de cuenta：',
    swiftCode: 'Código SWIFT：',
    countryRegion: 'País/Región：',
    beneficiaryAddress: 'Dirección del beneficiario：',
    beneficiaryBank: 'Banco beneficiario：',
    beneficiaryBankAddress: 'Dirección del banco：',
    bankCode: 'Código bancario：',
    branchCode: 'Código de sucursal：',
    contractIntro:
      'El vendedor acuerda vender y el comprador acuerda comprar las mercancías abajo mencionadas bajo los términos y condiciones establecidos a continuación:',
    colModel: 'Modelo',
    colDescription: 'Descripción y especificaciones de la mercancía',
    colQuantity: 'Cantidad',
    colUnitPrice: 'Precio unitario',
    colTotalAmount: 'Importe total',
    noGoods: 'Sin mercancías especificadas',
    totalPrefix: 'TOTAL:',
    transportRouteLabel: '运输路线 Ruta de transporte:',
    modeOfShipmentLabel: '运输方式 Modo de envío :',
    timeOfShipmentLabel: 'Plazo de envío:',
    partialShipmentLabel: 'Envío parcial:',
    transshipmentLabel: 'Transbordo:',
    piValidityLabel: 'Validez de la PI:',
    allowed: 'PERMITIDO',
    notAllowed: 'NO PERMITIDO',
    daysUnit: 'DÍAS',
    buildFullPaymentClause: ({ percent, payAmountStr, method }) =>
      `El Comprador deberá pagar el ${percent}% del monto total del contrato (${payAmountStr}) mediante ${method} dentro de los dos días calendario posteriores a la firma de este contrato. El Vendedor proporcionará fotos y videos del número VIN después de recibir el pago.`,
    buildSplitPaymentClause: ({
      depositPct,
      balancePct,
      totalStr,
      depositStr,
      balanceStr,
      method,
    }) =>
      `El Comprador deberá pagar un depósito del ${depositPct}% (${depositStr}) del monto total del contrato (${totalStr}) mediante ${method} dentro de los dos días calendario posteriores a la firma de este contrato. El saldo restante del ${balancePct}% (${balanceStr}) se pagará mediante ${method} tras completar los trámites de transferencia y exportación del vehículo. El Vendedor proporcionará fotos, videos del número VIN y los documentos de transferencia de exportación.`,
  },
};
