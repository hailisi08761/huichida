import { PiLanguage, ShipmentModeKey } from '../types/pi';

export interface ShippingPreset {
  key: ShipmentModeKey;
  labelZh: string;
  modeText: Record<PiLanguage, string>;
  defaultOrigin: string;
  defaultTimeOfShipment: Record<PiLanguage, string>;
}

export const SHIPMENT_MODES: Record<ShipmentModeKey, ShippingPreset> = {
  sea: {
    key: 'sea',
    labelZh: '海路运输 (By Sea)',
    modeText: {
      en: 'By Sea海路运输',
      fr: 'Par voie maritime (海路运输)',
      es: 'Por vía marítima (海路运输)',
    },
    defaultOrigin: 'Nansha Port, Guangzhou, China',
    defaultTimeOfShipment: {
      en: 'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS TWO MONTHS AFTER THE COMPLETION OF DELIVERY',
      fr: "LES INFORMATIONS DU TRANSITAIRE SONT FOURNIES PAR L'ACHETEUR, ET LA DATE D'EXPÉDITION AU PLUS TARD EST DE DEUX MOIS APRÈS L'ACHÈVEMENT DE LA LIVRAISON",
      es: 'LA INFORMACIÓN DEL AGENTE DE CARGA ES PROPORCIONADA POR EL COMPRADOR, Y LA FECHA LÍMITE DE EMBARQUE ES DOS MESES DESPUÉS DE COMPLETAR LA ENTREGA',
    },
  },
  land: {
    key: 'land',
    labelZh: '陆路运输 (By Land)',
    modeText: {
      en: 'By Land陆路运输',
      fr: 'Par voie terrestre (陆路运输)',
      es: 'Por vía terrestre (陆路运输)',
    },
    defaultOrigin: 'Khorgos Port, Xinjiang, China',
    defaultTimeOfShipment: {
      en: 'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS 45 DAYS AFTER RECEIPT OF FULL PAYMENT',
      fr: "LES INFORMATIONS DU TRANSITAIRE SONT FOURNIES PAR L'ACHETEUR, ET LA DATE D'EXPÉDITION AU PLUS TARD EST DE 45 JOURS APRÈS RÉCEPTION DU PAIEMENT",
      es: 'LA INFORMACIÓN DEL AGENTE DE CARGA ES PROPORCIONADA POR EL COMPRADOR, Y LA FECHA LÍMITE DE ENVÍO ES 45 DÍAS DESPUÉS DE RECIBIR EL PAGO',
    },
  },
  rail: {
    key: 'rail',
    labelZh: '铁路运输 (By Railway)',
    modeText: {
      en: 'By Railway铁路运输',
      fr: 'Par voie ferroviaire (铁路运输)',
      es: 'Por vía ferroviaria (铁路运输)',
    },
    defaultOrigin: 'Wuhan / Alashankou Railway Port, China',
    defaultTimeOfShipment: {
      en: 'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS 45 DAYS AFTER RECEIPT OF FULL PAYMENT',
      fr: "LES INFORMATIONS DU TRANSITAIRE SONT FOURNIES PAR L'ACHETEUR, ET LA DATE D'EXPÉDITION AU PLUS TARD EST DE 45 JOURS APRÈS RÉCEPTION DU PAIEMENT",
      es: 'LA INFORMACIÓN DEL AGENTE DE CARGA ES PROPORCIONADA POR EL COMPRADOR, Y LA FECHA LÍMITE DE ENVÍO ES 45 DÍAS DESPUÉS DE RECIBIR EL PAGO',
    },
  },
  air: {
    key: 'air',
    labelZh: '空运运输 (By Air)',
    modeText: {
      en: 'By Air空运运输',
      fr: 'Par voie aérienne (空运运输)',
      es: 'Por vía aérea (空运运输)',
    },
    defaultOrigin: 'Guangzhou Baiyun International Airport, China',
    defaultTimeOfShipment: {
      en: 'WITHIN 15 WORKING DAYS AFTER RECEIPT OF FULL PAYMENT AND BUYER AIRWAY BILL CONFIRMATION',
      fr: 'DANS LES 15 JOURS OUVRABLES SUIVANT LA RÉCEPTION DU PAIEMENT ET LA CONFIRMATION DE LA LTA',
      es: 'DENTRO DE LOS 15 DÍAS HÁBILES POSTERIORES A LA RECEPCIÓN DEL PAGO Y CONFIRMACIÓN DE LA GUÍA AÉREA',
    },
  },
  multimodal: {
    key: 'multimodal',
    labelZh: '海铁联运 (Sea-Rail)',
    modeText: {
      en: 'By Sea & Rail海铁联运',
      fr: 'Transport multimodal mer-rail (海铁联运)',
      es: 'Transporte multimodal marítimo-ferroviario (海铁联运)',
    },
    defaultOrigin: 'Nansha Port, Guangzhou, China',
    defaultTimeOfShipment: {
      en: 'THE FREIGHT FORWARDER INFORMATION IS PROVIDED BY THE BUYER, AND THE LATEST SHIPMENT DATE IS TWO MONTHS AFTER THE COMPLETION OF DELIVERY',
      fr: "LES INFORMATIONS DU TRANSITAIRE SONT FOURNIES PAR L'ACHETEUR, ET LA DATE D'EXPÉDITION AU PLUS TARD EST DE DEUX MOIS APRÈS L'ACHÈVEMENT DE LA LIVRAISON",
      es: 'LA INFORMACIÓN DEL AGENTE DE CARGA ES PROPORCIONADA POR EL COMPRADOR, Y LA FECHA LÍMITE DE EMBARQUE ES DOS MESES DESPUÉS DE COMPLETAR LA ENTREGA',
    },
  },
};

export const ORIGIN_PORT_PRESETS = [
  'Nansha Port, Guangzhou, China',
  'Shanghai Port, China',
  'Tianjin Port, China',
  'Qingdao Port, China',
  'Ningbo Port, China',
  'Khorgos Port, Xinjiang, China',
  'Guangzhou Baiyun International Airport, China',
];

interface DestinationRule {
  keywords: string[];
  destinationPort: string;
  modeKey: ShipmentModeKey;
  originPort?: string;
}

const DESTINATION_RULES: DestinationRule[] = [
  // South America
  {
    keywords: ['peru', 'perú', 'callao', 'lima', 'ucayali', 'manantay', 'arequipa', '秘鲁', '卡亚俄'],
    destinationPort: 'Callao Port, Peru',
    modeKey: 'sea',
  },
  {
    keywords: ['chile', 'santiago', 'san antonio', 'valparaiso', 'iquique', '智利'],
    destinationPort: 'San Antonio Port, Chile',
    modeKey: 'sea',
  },
  {
    keywords: ['ecuador', 'guayaquil', 'quito', 'manta', '厄瓜多尔'],
    destinationPort: 'Guayaquil Port, Ecuador',
    modeKey: 'sea',
  },
  {
    keywords: ['colombia', 'buenaventura', 'cartagena', 'bogota', '哥伦比亚'],
    destinationPort: 'Buenaventura Port, Colombia',
    modeKey: 'sea',
  },
  {
    keywords: ['brazil', 'brasil', 'santos', 'paranagua', 'sao paulo', '巴西'],
    destinationPort: 'Santos Port, Brazil',
    modeKey: 'sea',
  },
  {
    keywords: ['mexico', 'méxico', 'lazaro cardenas', 'manzanillo', 'veracruz', '墨西哥'],
    destinationPort: 'Lázaro Cárdenas Port, Mexico',
    modeKey: 'sea',
  },
  {
    keywords: ['dominican', 'santo domingo', 'caucedo', '多米尼加'],
    destinationPort: 'Caucedo Port, Dominican Republic',
    modeKey: 'sea',
  },
  {
    keywords: ['costa rica', 'caldera', 'limon', '哥斯达黎加'],
    destinationPort: 'Caldera Port, Costa Rica',
    modeKey: 'sea',
  },
  {
    keywords: ['panama', 'panamá', 'balboa', 'colon', '巴拿马'],
    destinationPort: 'Manzanillo / Balboa Port, Panama',
    modeKey: 'sea',
  },
  {
    keywords: ['uruguay', 'montevideo', '乌拉圭'],
    destinationPort: 'Montevideo Port, Uruguay',
    modeKey: 'sea',
  },
  {
    keywords: ['bolivia', 'la paz', 'santa cruz', '玻利维亚'],
    destinationPort: 'Iquique Port, Chile (Transit to Bolivia)',
    modeKey: 'multimodal',
  },
  {
    keywords: ['paraguay', 'asuncion', '巴拉圭'],
    destinationPort: 'Montevideo Port (Transit to Paraguay)',
    modeKey: 'multimodal',
  },
  // Africa & Indian Ocean
  {
    keywords: ['madagascar', 'toamasina', 'antananarivo', 'tamatave', '马达加斯加', '图阿马西纳'],
    destinationPort: 'Toamasina Port, Madagascar',
    modeKey: 'sea',
  },
  {
    keywords: ['nigeria', 'lagos', 'apapa', 'tin can', 'abuja', '尼日利亚'],
    destinationPort: 'Tin Can Island Port, Lagos, Nigeria',
    modeKey: 'sea',
  },
  {
    keywords: ['kenya', 'mombasa', 'nairobi', '肯尼亚'],
    destinationPort: 'Mombasa Port, Kenya',
    modeKey: 'sea',
  },
  {
    keywords: ['tanzania', 'dar es salaam', '坦桑尼亚'],
    destinationPort: 'Dar es Salaam Port, Tanzania',
    modeKey: 'sea',
  },
  {
    keywords: ['ethiopia', 'addis ababa', 'djibouti', '埃塞俄比亚', '吉布提'],
    destinationPort: 'Djibouti Port, Djibouti',
    modeKey: 'sea',
  },
  {
    keywords: ['egypt', 'alexandria', 'sokhna', 'cairo', '埃及'],
    destinationPort: 'Ain Sokhna Port, Egypt',
    modeKey: 'sea',
  },
  {
    keywords: ['algeria', 'algiers', 'oran', 'algérie', 'alger', '阿尔及利亚'],
    destinationPort: 'Algiers Port, Algeria',
    modeKey: 'sea',
  },
  {
    keywords: ['morocco', 'casablanca', 'tanger', 'tangier', 'maroc', '摩洛哥'],
    destinationPort: 'Tanger-Med Port, Morocco',
    modeKey: 'sea',
  },
  {
    keywords: ['senegal', 'sénégal', 'dakar', '塞内加尔'],
    destinationPort: 'Dakar Port, Senegal',
    modeKey: 'sea',
  },
  {
    keywords: ['ivory coast', 'côte d\'ivoire', 'abidjan', '科特迪瓦'],
    destinationPort: 'Abidjan Port, Côte d\'Ivoire',
    modeKey: 'sea',
  },
  {
    keywords: ['cameroon', 'cameroun', 'douala', '喀麦隆'],
    destinationPort: 'Douala Port, Cameroon',
    modeKey: 'sea',
  },
  {
    keywords: ['ghana', 'tema', 'accra', '加纳'],
    destinationPort: 'Tema Port, Ghana',
    modeKey: 'sea',
  },
  {
    keywords: ['south africa', 'durban', 'cape town', 'johannesburg', '南非'],
    destinationPort: 'Durban Port, South Africa',
    modeKey: 'sea',
  },
  {
    keywords: ['angola', 'luanda', '安哥拉'],
    destinationPort: 'Luanda Port, Angola',
    modeKey: 'sea',
  },
  {
    keywords: ['mauritius', 'port louis', '毛里求斯'],
    destinationPort: 'Port Louis, Mauritius',
    modeKey: 'sea',
  },
  // Middle East
  {
    keywords: ['uae', 'dubai', 'jebel ali', 'abu dhabi', 'sharjah', '阿联酋', '迪拜'],
    destinationPort: 'Jebel Ali Port, Dubai, UAE',
    modeKey: 'sea',
  },
  {
    keywords: ['saudi', 'jeddah', 'dammam', 'riyadh', '沙特'],
    destinationPort: 'Jeddah Islamic Port, Saudi Arabia',
    modeKey: 'sea',
  },
  {
    keywords: ['jordan', 'aqaba', 'amman', '约旦'],
    destinationPort: 'Aqaba Port, Jordan',
    modeKey: 'sea',
  },
  {
    keywords: ['iraq', 'umm qasr', 'basra', 'baghdad', '伊拉克'],
    destinationPort: 'Umm Qasr Port, Iraq',
    modeKey: 'sea',
  },
  {
    keywords: ['oman', 'sohar', 'muscat', '阿曼'],
    destinationPort: 'Sohar Port, Oman',
    modeKey: 'sea',
  },
  {
    keywords: ['kuwait', 'shuwaikh', '科威特'],
    destinationPort: 'Shuwaikh Port, Kuwait',
    modeKey: 'sea',
  },
  // Central Asia, Russia & CIS
  {
    keywords: ['kazakhstan', 'almaty', 'astana', 'shymkent', '哈萨克斯坦', '阿拉木图'],
    destinationPort: 'Almaty, Kazakhstan',
    modeKey: 'land',
    originPort: 'Khorgos Port, Xinjiang, China',
  },
  {
    keywords: ['uzbekistan', 'tashkent', 'samarkand', '乌兹别克斯坦', '塔什干'],
    destinationPort: 'Tashkent, Uzbekistan',
    modeKey: 'land',
    originPort: 'Khorgos Port, Xinjiang, China',
  },
  {
    keywords: ['kyrgyzstan', 'bishkek', '吉尔吉斯斯坦', '比什凯克'],
    destinationPort: 'Bishkek, Kyrgyzstan',
    modeKey: 'land',
    originPort: 'Irkeshtam / Torugart Port, Xinjiang, China',
  },
  {
    keywords: ['tajikistan', 'dushanbe', '塔吉克斯坦'],
    destinationPort: 'Dushanbe, Tajikistan',
    modeKey: 'land',
    originPort: 'Karasu Port, Xinjiang, China',
  },
  {
    keywords: ['russia', 'moscow', 'vladivostok', 'st. petersburg', '俄罗斯', '莫斯科'],
    destinationPort: 'Moscow, Russia',
    modeKey: 'rail',
    originPort: 'Manzhouli / Khorgos Port, China',
  },
  {
    keywords: ['belarus', 'minsk', '白俄罗斯'],
    destinationPort: 'Minsk, Belarus',
    modeKey: 'rail',
    originPort: 'Wuhan / Alashankou Railway Port, China',
  },
  {
    keywords: ['azerbaijan', 'baku', '阿塞拜疆'],
    destinationPort: 'Baku, Azerbaijan',
    modeKey: 'multimodal',
    originPort: 'Khorgos Port, Xinjiang, China',
  },
  {
    keywords: ['georgia', 'poti', 'tbilisi', '格鲁吉亚'],
    destinationPort: 'Poti Port, Georgia',
    modeKey: 'sea',
  },
  // Southeast Asia & South Asia
  {
    keywords: ['cambodia', 'phnom penh', 'sihanoukville', '柬埔寨'],
    destinationPort: 'Sihanoukville Port, Cambodia',
    modeKey: 'sea',
  },
  {
    keywords: ['laos', 'vientiane', '老挝', '万象'],
    destinationPort: 'Vientiane, Laos',
    modeKey: 'rail',
    originPort: 'Mohan Port, Yunnan, China',
  },
  {
    keywords: ['myanmar', 'yangon', '缅甸'],
    destinationPort: 'Yangon Port, Myanmar',
    modeKey: 'sea',
  },
  {
    keywords: ['thailand', 'bangkok', 'laem chabang', '泰国'],
    destinationPort: 'Laem Chabang Port, Thailand',
    modeKey: 'sea',
  },
  {
    keywords: ['vietnam', 'ho chi minh', 'haiphong', 'hanoi', '越南'],
    destinationPort: 'Hai Phong / Cat Lai Port, Vietnam',
    modeKey: 'sea',
  },
  {
    keywords: ['pakistan', 'karachi', '巴基斯坦'],
    destinationPort: 'Karachi Port, Pakistan',
    modeKey: 'sea',
  },
  {
    keywords: ['bangladesh', 'chittagong', 'dhaka', '孟加拉'],
    destinationPort: 'Chittagong Port, Bangladesh',
    modeKey: 'sea',
  },
  {
    keywords: ['sri lanka', 'colombo', '斯里兰卡'],
    destinationPort: 'Colombo Port, Sri Lanka',
    modeKey: 'sea',
  },
];

export interface InferredShipping {
  originPort: string;
  destinationPort: string;
  transportRoute: string;
  modeKey: ShipmentModeKey;
  modeOfShipment: string;
  timeOfShipment: string;
  matchedLabel: string;
}

export function inferModeFromPortsText(
  originText: string,
  destinationText: string
): ShipmentModeKey | null {
  const combined = `${originText} ${destinationText}`.toLowerCase();
  if (
    combined.includes('airport') ||
    combined.includes('air port') ||
    combined.includes('机场')
  ) {
    return 'air';
  }
  if (
    combined.includes('railway') ||
    combined.includes('train') ||
    combined.includes('rail') ||
    combined.includes('铁路')
  ) {
    return 'rail';
  }
  if (
    combined.includes('khorgos') ||
    combined.includes('irkeshtam') ||
    combined.includes('torugart') ||
    combined.includes('karasu') ||
    combined.includes('霍尔果斯') ||
    combined.includes('阿拉山口')
  ) {
    return 'land';
  }
  if (
    combined.includes('port') ||
    combined.includes('harbor') ||
    combined.includes('harbour') ||
    combined.includes('港')
  ) {
    return 'sea';
  }
  return null;
}

export function buildTransportRoute(originPort: string, destinationPort: string): string {
  const o = originPort.trim() || 'Nansha Port, Guangzhou, China';
  const d = destinationPort.trim() || 'Buyer Designated Destination Port';
  return `${o} to ${d}`;
}

export function inferShipping(params: {
  originPort?: string;
  destinationPort?: string;
  buyerAddress: string;
  buyerName?: string;
  preferredMode?: ShipmentModeKey;
  lang?: PiLanguage;
}): InferredShipping {
  const {
    originPort: customOrigin,
    destinationPort: customDest,
    buyerAddress,
    buyerName = '',
    preferredMode,
    lang = 'en',
  } = params;

  const destQuery = (customDest || '').trim();
  const addressQuery = `${buyerAddress} ${buyerName}`.trim();
  const searchSource = destQuery ? destQuery.toLowerCase() : addressQuery.toLowerCase();

  for (const rule of DESTINATION_RULES) {
    if (rule.keywords.some((kw) => searchSource.includes(kw))) {
      const portDerivedMode = inferModeFromPortsText(
        customOrigin || '',
        destQuery || rule.destinationPort
      );
      const effectiveModeKey = preferredMode ?? portDerivedMode ?? rule.modeKey;
      const preset = SHIPMENT_MODES[effectiveModeKey];

      const resolvedOrigin =
        customOrigin && customOrigin.trim()
          ? customOrigin.trim()
          : preferredMode && preferredMode !== rule.modeKey
            ? preset.defaultOrigin
            : rule.originPort ?? preset.defaultOrigin;

      const resolvedDest = destQuery || rule.destinationPort;

      return {
        originPort: resolvedOrigin,
        destinationPort: resolvedDest,
        transportRoute: buildTransportRoute(resolvedOrigin, resolvedDest),
        modeKey: effectiveModeKey,
        modeOfShipment: preset.modeText[lang],
        timeOfShipment: preset.defaultTimeOfShipment[lang],
        matchedLabel: resolvedDest,
      };
    }
  }

  // Fallback when no known rule keyword matched
  const portDerivedMode = inferModeFromPortsText(customOrigin || '', destQuery);
  const modeKey = preferredMode ?? portDerivedMode ?? 'sea';
  const preset = SHIPMENT_MODES[modeKey];
  const resolvedOrigin = customOrigin?.trim() || preset.defaultOrigin;

  let resolvedDest = destQuery;
  if (!resolvedDest) {
    const cleanedLines = buyerAddress
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const lastToken = cleanedLines[cleanedLines.length - 1];
    resolvedDest = lastToken
      ? `Destination Port (${lastToken})`
      : 'Buyer Designated Destination Port';
  }

  return {
    originPort: resolvedOrigin,
    destinationPort: resolvedDest,
    transportRoute: buildTransportRoute(resolvedOrigin, resolvedDest),
    modeKey,
    modeOfShipment: preset.modeText[lang],
    timeOfShipment: preset.defaultTimeOfShipment[lang],
    matchedLabel: resolvedDest,
  };
}
