const formatKiloMeasurement = (value: number | string | undefined): string => {
  if (!value) return "";

  // Convert string to number
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (numValue === 0.25) return "1/4";
  if (numValue === 0.5 || numValue === 0.5) return "1/2";
  return numValue.toString();
};

export default formatKiloMeasurement;