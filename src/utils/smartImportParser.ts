import {
  PaymentPlanType,
  PiLanguage,
  ProductItem,
  ShipmentModeKey,
} from '../types/pi';
import { inferShipping } from './shippingMatcher';

export interface SmartImportResult {
  piNumber?: string;
  date?: string;
  language?: PiLanguage;
  buyerName?: string;
  buyerAddress?: string;
  buyerTel?: string;
  originPort?: string;
  destinationPort?: string;
  modeKey?: ShipmentModeKey;
  paymentPlan?: PaymentPlanType;
  paymentPercent?: number;
  piValidityDays?: number;
  products: ProductItem[];
  matchedFieldsCount: number;
}

const KNOWN_BRANDS = [
  'jetour',
  'hyundai',
  'toyota',
  'byd',
  'changan',
  'geely',
  'chery',
  'haval',
  'gwm',
  'great wall',
  'tank',
  'mg',
  'kia',
  'nissan',
  'honda',
  'volkswagen',
  'vw',
  'bmw',
  'mercedes',
  'audi',
  'lexus',
  'ford',
  'chevrolet',
  'suzuki',
  'mitsubishi',
  'mazda',
  'peugeot',
  'renault',
  'dongfeng',
  'voyah',
  'gac',
  'trumpchi',
  'aion',
  'nio',
  'xpeng',
  'li auto',
  'lixiang',
  'zeekr',
  'avatr',
  'deepal',
  'shenlan',
  'leapmotor',
  'wuling',
  'baojun',
  'jac',
  'foton',
  'sinotruk',
  'howo',
  'shacman',
  'faw',
  'hongqi',
  'bestune',
  'baic',
  'kaiyi',
  'soueast',
  'omoda',
  'jaecoo',
  'exeed',
  'rox',
  'polar stone',
  '捷途',
  '现代',
  '丰田',
  '比亚迪',
  '长安',
  '吉利',
  '奇瑞',
  '哈弗',
  '长城',
  '坦克',
  '起亚',
  '日产',
  '本田',
  '大众',
  '东风',
  '岚图',
  '广汽',
  '传祺',
  '埃安',
  '蔚来',
  '小鹏',
  '理想',
  '极氪',
  '深蓝',
  '零跑',
  '五菱',
  '江淮',
  '福田',
  '重汽',
  '豪沃',
  '陕汽',
  '红旗',
  '北汽',
  '凯翼',
  '星途',
];

function cleanLabelValue(raw: string): string {
  return raw.replace(/^[\s:：\-–—]+/, '').trim();
}

function parseNumericToken(raw: string): number {
  const cleaned = raw.replace(/[,$\s]/g, '').replace(/[^\d.]/g, '');
  const val = Number(cleaned);
  return Number.isFinite(val) ? val : 0;
}

function splitBrandAndDesc(text: string): { model: string; description: string } {
  const trimmed = text.trim();
  if (!trimmed) return { model: '', description: '' };

  const lower = trimmed.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.startsWith(brand)) {
      const nextChar = trimmed.charAt(brand.length);
      if (!nextChar || /[\s\-_/.,，]/.test(nextChar)) {
        const brandSlice = trimmed.slice(0, brand.length);
        // Capitalize ascii brands nicely
        const normalizedBrand = /^[a-z\s]+$/i.test(brandSlice)
          ? brandSlice
              .split(' ')
              .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
              .join(' ')
          : brandSlice;
        // Also see if there's a short second word like "Hyundai Elantra"
        const rest = trimmed.slice(brand.length).trim();
        const secondWordMatch = rest.match(/^([A-Za-z0-9\u4e00-\u9fa5-]{2,14})(?:\s+(.+))?$/);
        if (
          secondWordMatch &&
          !/^\d{4}$/.test(secondWordMatch[1]) &&
          !/^(model|edition|cvt|auto|1\.|2\.|3\.)/i.test(secondWordMatch[1]) &&
          secondWordMatch[2]
        ) {
          return {
            model: `${normalizedBrand} ${secondWordMatch[1]}`,
            description: trimmed,
          };
        }
        return {
          model: normalizedBrand,
          description: trimmed,
        };
      }
    }
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return {
      model: words[0],
      description: trimmed,
    };
  }
  return { model: trimmed, description: trimmed };
}

function tryParseProductLine(line: string, index: number): ProductItem | null {
  const stripped = line.replace(/^\s*(?:\d+[.)、]|[•\-*])\s*/, '').trim();
  if (!stripped) return null;

  // 1. Tab-separated Excel/WPS row: Model \t Description \t Qty \t UnitPrice (\t Total)
  if (stripped.includes('\t')) {
    const cols = stripped.split('\t').map((c) => c.trim());
    if (cols.length >= 3) {
      const numericCols = cols
        .map((c, idx) => ({ idx, val: parseNumericToken(c), isNum: /^[\s$￥¥USusd\d,.-]+$/i.test(c) && /\d/.test(c) }))
        .filter((x) => x.isNum);

      if (numericCols.length >= 2) {
        const qty = numericCols[0].val || 1;
        const unitPrice = numericCols[1].val || 0;
        const textCols = cols.filter((_, i) => i < numericCols[0].idx);
        const model = textCols[0] || '';
        const description = textCols.slice(1).join(' ') || model;
        if (model || description) {
          return {
            id: `imp-${Date.now()}-${index}`,
            model: model || splitBrandAndDesc(description).model,
            description,
            quantity: qty,
            unitPrice,
          };
        }
      }
    }
  }

  // 2. Pipe or comma/semicolon structured line containing price/qty
  const hasCurrencyOrPrice =
    /(?:\$|usd|us\$|美元|美金|单价|price)\s*[:：]?\s*[\d,]+(?:\.\d+)?/i.test(stripped) ||
    /[\d,]+(?:\.\d+)?\s*(?:usd|美元|美金|\$)/i.test(stripped);
  const hasQtyToken =
    /(?:qty|quantity|数量)\s*[:：]?\s*\d+/i.test(stripped) ||
    /(?:\d+\s*(?:台|辆|套|件|个|units?|pcs|sets?)|[x×*]\s*\d+|\d+\s*[x×*])/i.test(stripped);

  if (!hasCurrencyOrPrice && !hasQtyToken) {
    return null;
  }

  let working = stripped;
  let unitPrice = 0;
  let quantity = 1;

  // Extract price
  const priceMatch =
    working.match(/(?:unit\s*price|price|单价)\s*[:：]?\s*(?:us\$|\$|usd)?\s*([\d,]+(?:\.\d+)?)/i) ||
    working.match(/(?:us\$|\$|usd)\s*([\d,]+(?:\.\d+)?)/i) ||
    working.match(/([\d,]+(?:\.\d+)?)\s*(?:usd|us\$|美元|美金|\$)/i);

  if (priceMatch) {
    unitPrice = parseNumericToken(priceMatch[1]);
    working = working.replace(priceMatch[0], ' ');
  }

  // Extract quantity
  const qtyMatch =
    working.match(/(?:qty|quantity|数量)\s*[:：]?\s*(\d+)/i) ||
    working.match(/(\d+)\s*(?:台|辆|套|件|个|units?|pcs|sets?)\b/i) ||
    working.match(/(?:^|\s)[x×*]\s*(\d+)(?:\s|$)/i) ||
    working.match(/(?:^|\s)(\d+)\s*[x×*](?:\s|$)/i);

  if (qtyMatch) {
    quantity = Math.max(1, parseInt(qtyMatch[1], 10) || 1);
    working = working.replace(qtyMatch[0], ' ');
  }

  // Clean leftover separators and extract model + description
  const textPart = working
    .replace(/[|｜/]+/g, ' ')
    .replace(/[,，;；]+\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!textPart && unitPrice === 0) return null;

  // Check if user wrote "Jetour - Jetour 2025 ..." or "Jetour: ..."
  const dashSplit = textPart.match(/^([A-Za-z0-9\u4e00-\u9fa5\s]{2,22}?)\s*[-–—:：]\s*(.+)$/);
  if (dashSplit && dashSplit[1].trim().length <= 22 && dashSplit[2].trim().length > 4) {
    return {
      id: `imp-${Date.now()}-${index}`,
      model: dashSplit[1].trim(),
      description: dashSplit[2].trim(),
      quantity,
      unitPrice,
    };
  }

  const { model, description } = splitBrandAndDesc(textPart);
  return {
    id: `imp-${Date.now()}-${index}`,
    model,
    description,
    quantity,
    unitPrice,
  };
}

export function parseSmartImportText(rawText: string): SmartImportResult {
  const result: SmartImportResult = {
    products: [],
    matchedFieldsCount: 0,
  };

  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return result;

  const lines = normalized.split('\n');
  const lowerAll = normalized.toLowerCase();

  // Detect explicit language preference if mentioned
  if (/(?:法文|法语|french|français|francais)/i.test(lowerAll)) {
    result.language = 'fr';
  } else if (/(?:西班牙文|西班牙语|spanish|español|espanol)/i.test(lowerAll)) {
    result.language = 'es';
  } else if (/(?:英文|英语|english)/i.test(lowerAll)) {
    result.language = 'en';
  }

  // Detect Payment Plan
  if (/(?:30%|30\s*%|三成|定金.*70%|70%.*尾款|转移出口|出口手续)/i.test(normalized)) {
    result.paymentPlan = 'deposit_30_70';
    result.paymentPercent = 30;
  } else if (/(?:100%|全款|full\s*payment)/i.test(normalized)) {
    result.paymentPlan = 'full_100';
    result.paymentPercent = 100;
  } else {
    const customDeposit = normalized.match(/(?:定金|deposit|acompte|depósito)\s*[:：]?\s*(\d{1,2})\s*%/i);
    if (customDeposit) {
      const pct = parseInt(customDeposit[1], 10);
      if (pct > 0 && pct < 100) {
        result.paymentPlan = 'custom_split';
        result.paymentPercent = pct;
      }
    }
  }

  // Detect Transport Mode
  if (/(?:by\s*sea|海运|海路|maritime|marítima)/i.test(lowerAll)) {
    result.modeKey = 'sea';
  } else if (/(?:by\s*land|陆运|陆路|terrestre)/i.test(lowerAll)) {
    result.modeKey = 'land';
  } else if (/(?:by\s*rail|铁路|铁运|ferroviaire|ferroviaria)/i.test(lowerAll)) {
    result.modeKey = 'rail';
  } else if (/(?:by\s*air|空运|aérienne|aérea)/i.test(lowerAll)) {
    result.modeKey = 'air';
  } else if (/(?:海铁|multimodal)/i.test(lowerAll)) {
    result.modeKey = 'multimodal';
  }

  // Line-by-line structured extraction + multi-line address / product block accumulation
  let activeSection: 'none' | 'address' | 'product' = 'none';
  const addressLines: string[] = [];
  let pendingProduct: Partial<ProductItem> | null = null;

  const flushPendingProduct = (idx: number) => {
    if (
      pendingProduct &&
      (pendingProduct.model || pendingProduct.description || pendingProduct.unitPrice)
    ) {
      const desc = pendingProduct.description || pendingProduct.model || '';
      const model = pendingProduct.model || splitBrandAndDesc(desc).model;
      result.products.push({
        id: `imp-${Date.now()}-${idx}`,
        model,
        description: desc,
        quantity: pendingProduct.quantity || 1,
        unitPrice: pendingProduct.unitPrice || 0,
      });
    }
    pendingProduct = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      activeSection = 'none';
      flushPendingProduct(i);
      continue;
    }

    // PI Number
    const piNoMatch = line.match(/^(?:编号\s*No|PI\s*No\.?|Invoice\s*No\.?|单号|编号)\s*[:：]\s*(.+)$/i);
    if (piNoMatch) {
      result.piNumber = cleanLabelValue(piNoMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Date
    const dateMatch = line.match(/^(?:日期\s*Date|Date|Fecha|日期)\s*[:：]\s*(.+)$/i);
    if (dateMatch) {
      result.date = cleanLabelValue(dateMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Buyer / Customer Name
    const buyerMatch = line.match(
      /^(?:Buyer|Customer|Client|Acheteur|Comprador|客户名称|客户公司|客户|买方名称|买方|公司名称|公司)\s*[:：]\s*(.+)$/i
    );
    if (buyerMatch) {
      result.buyerName = cleanLabelValue(buyerMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Buyer Address
    const addrMatch = line.match(
      /^(?:Add|Addr|Address|Adresse|Dirección|Direccion|客户地址|收货地址|地址)\s*[:：]\s*(.*)$/i
    );
    if (addrMatch) {
      const val = cleanLabelValue(addrMatch[1]);
      if (val) addressLines.push(val);
      activeSection = 'address';
      continue;
    }

    // Buyer Tel / Phone / WhatsApp
    const telMatch = line.match(
      /^(?:Tel|Telephone|Phone|Mobile|WhatsApp|Cell|Tél|客户电话|联系电话|电话|手机|联系方式)\s*[:：]\s*(.+)$/i
    );
    if (telMatch) {
      result.buyerTel = cleanLabelValue(telMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Origin Port
    const originMatch = line.match(
      /^(?:Origin\s*Port|POL|From|起运港|出发港|起运口岸|装运港)\s*[:：]\s*(.+)$/i
    );
    if (originMatch) {
      result.originPort = cleanLabelValue(originMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Destination Port
    const destMatch = line.match(
      /^(?:Destination\s*Port|Dest\s*Port|POD|Destination|目的港|目的地|卸货港|港口)\s*[:：]\s*(.+)$/i
    );
    if (destMatch) {
      result.destinationPort = cleanLabelValue(destMatch[1]);
      activeSection = 'none';
      continue;
    }

    // Transport Route ("Origin to Destination")
    const routeMatch = line.match(
      /^(?:运输路线\s*Transport\s*Route|Transport\s*Route|Route|运输路线)\s*[:：]\s*(.+)$/i
    );
    if (routeMatch) {
      const routeVal = cleanLabelValue(routeMatch[1]);
      const toSplit = routeVal.split(/\s+(?:to|->|→|至)\s+/i);
      if (toSplit.length >= 2) {
        result.originPort = toSplit[0].trim();
        result.destinationPort = toSplit.slice(1).join(' to ').trim();
      } else {
        result.destinationPort = routeVal;
      }
      activeSection = 'none';
      continue;
    }

    // Structured Product Fields (Model / Description / Qty / Unit Price)
    const modelField = line.match(/^(?:Model|品牌|型号|车型)\s*[:：]\s*(.+)$/i);
    if (modelField) {
      if (pendingProduct && pendingProduct.model) {
        flushPendingProduct(i);
      }
      pendingProduct = pendingProduct || {};
      pendingProduct.model = cleanLabelValue(modelField[1]);
      activeSection = 'product';
      continue;
    }

    const descField = line.match(
      /^(?:Description(?:\s*&\s*Specification(?:\s*of\s*Goods)?)?|Spec|Specification|配置|描述|规格|产品描述|产品)\s*[:：]\s*(.+)$/i
    );
    if (descField) {
      pendingProduct = pendingProduct || {};
      pendingProduct.description = cleanLabelValue(descField[1]);
      activeSection = 'product';
      continue;
    }

    const qtyField = line.match(/^(?:Quantity|Qty|数量)\s*[:：]\s*(\d+)/i);
    if (qtyField) {
      pendingProduct = pendingProduct || {};
      pendingProduct.quantity = Math.max(1, parseInt(qtyField[1], 10) || 1);
      activeSection = 'product';
      continue;
    }

    const priceField = line.match(
      /^(?:Unit\s*Price|Price|单价|价格)\s*[:：]\s*(?:us\$|\$|usd)?\s*([\d,]+(?:\.\d+)?)/i
    );
    if (priceField) {
      pendingProduct = pendingProduct || {};
      pendingProduct.unitPrice = parseNumericToken(priceField[1]);
      activeSection = 'product';
      continue;
    }

    // Continuation of multi-line address
    if (activeSection === 'address') {
      // Stop address accumulation if this line looks like a product or phone
      const looksLikeProduct = tryParseProductLine(line, i);
      const looksLikePhone = /^[+\d][\d\s\-().]{6,}$/.test(line);
      if (!looksLikeProduct && !looksLikePhone) {
        addressLines.push(line);
        continue;
      } else {
        activeSection = 'none';
      }
    }

    // Try single-line product parsing
    const parsedLineProduct = tryParseProductLine(line, i);
    if (parsedLineProduct) {
      flushPendingProduct(i);
      result.products.push(parsedLineProduct);
      continue;
    }

    // Heuristic unlabeled phone detection
    if (!result.buyerTel) {
      const phoneMatch = line.match(/^(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,5}$/);
      if (phoneMatch) {
        result.buyerTel = line;
        continue;
      }
    }

    // Heuristic unlabeled company/buyer name (first short non-address line)
    if (
      !result.buyerName &&
      /(?:co\.,?\s*ltd|ltd\.?|llc|inc\.?|corp\.?|s\.a\.?c?\.?|sarl|gmbh|empresa|trading|motors|auto|贸易|公司)/i.test(
        line
      )
    ) {
      result.buyerName = line;
      continue;
    }
  }

  flushPendingProduct(lines.length);

  if (addressLines.length > 0) {
    result.buyerAddress = addressLines.join('\n');
  }

  // Fallback heuristics if user pasted a simple 3-line block without labels:
  // e.g. Line 1: Company Name, Line 2: Address, Line 3: Phone
  if (!result.buyerName && !result.buyerAddress && result.products.length === 0) {
    const nonEmptyLines = lines.map((l) => l.trim()).filter(Boolean);
    if (nonEmptyLines.length > 0 && !tryParseProductLine(nonEmptyLines[0], 0)) {
      result.buyerName = nonEmptyLines[0];
    }
    if (nonEmptyLines.length > 1 && !result.buyerTel) {
      const last = nonEmptyLines[nonEmptyLines.length - 1];
      if (/^[+\d][\d\s\-().]{6,}$/.test(last)) {
        result.buyerTel = last;
        if (nonEmptyLines.length > 2) {
          result.buyerAddress = nonEmptyLines.slice(1, -1).join('\n');
        }
      } else {
        result.buyerAddress = nonEmptyLines.slice(1).join('\n');
      }
    }
  }

  // If destinationPort wasn't explicitly labeled, infer from buyerAddress
  if (!result.destinationPort && result.buyerAddress) {
    const inferred = inferShipping({
      originPort: result.originPort,
      buyerAddress: result.buyerAddress,
      buyerName: result.buyerName,
      preferredMode: result.modeKey,
      lang: result.language || 'en',
    });
    if (inferred.destinationPort) {
      result.destinationPort = inferred.destinationPort;
    }
    if (!result.originPort) {
      result.originPort = inferred.originPort;
    }
    if (!result.modeKey) {
      result.modeKey = inferred.modeKey;
    }
  }

  // Count matched fields
  let count = 0;
  if (result.buyerName) count++;
  if (result.buyerAddress) count++;
  if (result.buyerTel) count++;
  if (result.originPort) count++;
  if (result.destinationPort) count++;
  if (result.piNumber) count++;
  if (result.date) count++;
  count += result.products.length;
  result.matchedFieldsCount = count;

  return result;
}
