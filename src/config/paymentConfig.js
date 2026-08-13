import { PAYMENT_ASSETS } from './paymentAssets';

export const PAYMENT_CONFIG = {
  bancolombia: {
    account_number: "000-000000-00", // PLACEHOLDER_BANCOLOMBIA
    type: "Ahorros",
    logo: PAYMENT_ASSETS.bancolombia
  },
  nequi: {
    number: "3000000000", // PLACEHOLDER_NEQUI
    logo: PAYMENT_ASSETS.nequi
  },
  breb: {
    key: "adrenaline@breb.com", // PLACEHOLDER_BREB
    logo: PAYMENT_ASSETS.breb
  },
  beneficiary: {
    name: "Desierto de Checua"
  },
  whatsapp: {
    official_number: "573015119344",
    logo: PAYMENT_ASSETS.whatsapp
  }
};
