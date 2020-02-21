export interface Prediction {
  description: string;
  id: string;
  place_id: string;
  types: string[];
}

export interface RibbonResponse {
  npi: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  age?: string;
  gender: string;
  ratings_count: number;
  ratings_avg?: number;
  degrees: string[];
  specialties: RibbonSpecialties[];
  languages: string[];
  educations: string[];
  insurances: string[];
  provider_types: string[];
  locations: RibbonLocations[];
  online_profiles?: string[];
  status: string;
}

interface RibbonSpecialties {
  uuid: string;
  taxonomy_code: string;
  board_specialty: string;
  board_sub_specialty: string;
  non_md_specialty?: string;
  non_md_sub_specialty?: string;
  provider_name: string;
  colloquial: string;
  taxonomy_1: string;
  taxonomy_2: string;
  taxonomy_3: string;
  display: string;
  provider_type: string;
}

interface RibbonLocations {
  uuid: string;
  name?: string;
  address: string;
  address_details: RibbonAddressDetails;
  latitude: number;
  longitude: number;
  google_maps_link: string;
  confidence: number;
  phone_numbers: RibbonPhoneNumbers[];
  faxes?: RibbonPhoneNumbers[];
  insurances?: string[];
}

interface RibbonAddressDetails {
  street: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip: string;
}

interface RibbonPhoneNumbers {
  phone: string;
  details: string;
}

export const isGooglePrediction = (option: Prediction | RibbonResponse): option is Prediction => {
  return (option as Prediction).description !== undefined;
}