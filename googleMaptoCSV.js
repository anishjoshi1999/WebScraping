function arrayToCSV(data) {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((value) => (typeof value === "string" ? `"${value}"` : value))
      .join(",")
  );

  return [headers, ...rows].join("\n");
}
module.exports = { arrayToCSV };
