/**
 * Localização fixa do totem. Todos os cálculos de distância e tempo partem daqui.
 *
 * ATENÇÃO — CONFIRMAR: o Nominatim (OpenStreetMap) não tem o número 1555 cadastrado.
 * As coordenadas abaixo são o ponto central do trecho da Rua Coronel Sarmento
 * (Vila Angélica / Parque Ely). Ajuste lat/lng para a posição exata da Parada 1.
 */
export type TotemLocation = { name: string; address: string; lat: number; lng: number };

export const TOTEM_LOCATION: TotemLocation = {
  name: "Parada 1",
  address: "Rua Coronel Sarmento, 1555 – Parada 1, Gravataí, RS",
  lat: -29.9455805,
  lng: -50.9911082,
};
