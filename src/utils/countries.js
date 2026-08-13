export const COUNTRIES = [
  { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
  { code: 'MX', name: 'México' },
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'PE', name: 'Perú' },
  { code: 'CL', name: 'Chile' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'PA', name: 'Panamá' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'CU', name: 'Cuba' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japón' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Rusia' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'SA', name: 'Arabia Saudita' },
  { code: 'EG', name: 'Egipto' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turquía' },
  { code: 'GR', name: 'Grecia' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'AT', name: 'Austria' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'SG', name: 'Singapur' },
  { code: 'MY', name: 'Malasia' },
  { code: 'TH', name: 'Tailandia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'PK', name: 'Pakistán' },
  { code: 'BD', name: 'Bangladés' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenia' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'other', name: 'Otro' }
];

const FLAG_CDN_BASE = 'https://flagcdn.com';

export const getFlagUrl = (code, size = 'w40') => {
  if (!code) return null;
  const clean = String(code).trim().toLowerCase();
  if (!clean || clean === 'other') return null;
  return `${FLAG_CDN_BASE}/${size}/${clean}.png`;
};

export const findCountry = (value) => {
  if (!value) return null;
  const clean = String(value).trim();
  if (!clean) return null;

  const byCode = COUNTRIES.find(
    c => c.code.toLowerCase() === clean.toLowerCase()
  );
  if (byCode) return byCode;

  const byName = COUNTRIES.find(
    c => c.name.toLowerCase() === clean.toLowerCase()
  );
  if (byName) return byName;

  const byNameContains = COUNTRIES.find(
    c => c.name.toLowerCase().includes(clean.toLowerCase()) ||
         clean.toLowerCase().includes(c.name.toLowerCase())
  );
  if (byNameContains) return byNameContains;

  return null;
};

export const getCountryFlag = (value, size = 'w40') => {
  const country = findCountry(value);
  if (!country) return null;
  return getFlagUrl(country.code, size);
};

export const getCountryName = (value) => {
  const country = findCountry(value);
  return country ? country.name : value || '';
};
