
export type StationsFromApi = {
  Fecha: string;
  ListaEESSPrecio: MaritimeStationPrice[] | LandStationPrice[];
  Nota: string;
  ResultadoConsulta: string;
};

export interface BaseStationPrice {
  "C.P.": string;
  "Dirección": string;
  "Horario": string;
  "Latitud": string;
  "Localidad": string;
  "Longitud (WGS84)": string;
  "Municipio": string;
  "Provincia": string;
  "Remisión": string;
  "Rótulo": string;
  "Tipo Venta": string;
  "IDMunicipio": string;
  "IDProvincia": string;
  "IDCCAA": string;
  "Precio Amoniaco": string;
  "Precio Biogas Natural Comprimido": string;
  "Precio Biogas Natural Licuado": string;
  "Precio Diésel Renovable": string;
  "Precio Gasoleo B": string;
  "Precio Gasolina 95 E10": string;
  "Precio Gasolina 95 E25": string;
  "Precio Gasolina 95 E5": string;
  "Precio Gasolina 95 E85": string;
  "Precio Gasolina Renovable": string;
  "Precio Metanol": string;
  "PrecioProducto":string
}

export interface LandStationPrice extends BaseStationPrice {
  "IDEESS": string;
  "Margen": string;
  "% BioEtanol": string;
  "% ÉsterMetílico": string;
  "Precio AdBlue": string;
  "Precio Biodiesel": string;
  "Precio Bioetanol": string;
  "Precio Gas Natural Comprimido": string;
  "Precio Gas Natural Licuado": string;
  "Precio Gases licuados del petróleo": string;
  "Precio Gasoleo A": string;
  "Precio Gasoleo Premium": string;
  "Precio Gasolina 95 E5 Premium": string;
  "Precio Gasolina 98 E10": string;
  "Precio Gasolina 98 E5": string;
  "Precio Hidrogeno": string;
}

export interface MaritimeStationPrice extends BaseStationPrice {
  "IDPosteMaritimo": string;
  "Puerto": string;
  "Precio Adblue": string;
  "Precio Gasoleo A habitual": string;
  "Precio Gasóleo para uso marítimo": string;
}
