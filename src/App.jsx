import React, { useState } from "react";

// Minimal CSV parse example:
function parseCSV(csvText) {
  // Splits lines
  const lines = csvText.trim().split("\n");
  // First line is header
  const headers = lines[0].split(",");

  // Convert each row into an object
  const data = lines.slice(1).map(line => {
    const values = line.split(",");
    let rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header.trim()] = values[index]?.trim() || "";
    });
    return rowObj;
  });

  return data;
}

// A simple placeholder measure function
function measureCarbon(row) {
  // For example, if geo_location = 'US-East-1' => factor, or isGreen from hosting, etc.
  // We'll do a naive approach: CO2 = impressions * file_size_kb * 0.0001
  const impressions = parseInt(row.impressions, 10) || 0;
  const fileSize = parseInt(row.file_size_kb, 10) || 0;

  // Carbon formula placeholder
  const co2 = impressions * fileSize * 0.0001; // made-up factor
  return co2.toFixed(3);
}

export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);

  const handleFileUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const text = await file.text(); // read the CSV file as text
    const parsed = parseCSV(text);
    setCsvData(parsed);

    // Now measure carbon for each row
    const measured = parsed.map((row) => {
      const co2_kg = measureCarbon(row);
      return { ...row, co2_kg };
    });
    setResults(measured);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, color: "#2E7D32" }}>AdVerde MVP</h1>
      <p>Upload a CSV with headers like:</p>
      <pre>publisher, file_size_kb, geo_location, impressions, etc.</pre>

      <input type="file" accept=".csv" onChange={handleFileUpload} />
      
      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Calculated CO₂ Results</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {/* dynamically render columns based on first row keys */}
                {Object.keys(results[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  {Object.keys(row).map((key) => (
                    <td key={key}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
