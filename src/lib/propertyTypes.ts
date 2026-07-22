export const PROPERTY_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "independent_house", label: "Independent House" },
  { value: "villa", label: "Villa" },
  { value: "duplex", label: "Duplex" },
  { value: "penthouse", label: "Penthouse" },
  { value: "plot", label: "Plot" },
  { value: "residential_land", label: "Residential Land" },
  { value: "office_space", label: "Office Space" },
  { value: "shop", label: "Shop" },
  { value: "showroom", label: "Showroom" },
  { value: "warehouse", label: "Warehouse" },
  { value: "factory", label: "Factory" },
  { value: "commercial_land", label: "Commercial Land" },
  { value: "agricultural_land", label: "Agricultural Land" },
  { value: "farm_land", label: "Farm Land" },
  { value: "plantation", label: "Plantation" },
  { value: "pg", label: "PG" },
  { value: "hostel", label: "Hostel" },
  { value: "serviced_apartment", label: "Serviced Apartment" },
] as const;

const PROPERTY_TYPE_LABELS = new Map(PROPERTY_TYPE_OPTIONS.map((option) => [option.value, option.label]));

export function getPropertyTypeLabel(value: string) {
  return PROPERTY_TYPE_LABELS.get(value) || value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
