import React, { useState } from "react";

// 1) Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");

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

// 2) Naive carbon calculation
function measureBaseCarbon(impressions, fileSizeKB) {
  // For example: co2 = impressions * fileSizeKB * 0.0001
  return impressions * fileSizeKB * 0.0001;
}

// 3) A function to call Greencheck API
async function checkIfGreen(domain) {
  try {
    const response = await fetch(`https://api.thegreenwebfoundation.org/greencheck/${domain}`);
    if (!response.ok) {
      console.warn(`Greencheck call failed for ${domain}`, response.status);
      return false;
    }
    const data = await response.json();
    return data.green === true;
  } catch (error) {
    console.error("Greencheck error:", error);
    return false;
  }
}

// 4) A function to measure row CO₂, factoring in green hosting
async function measureRow(row) {
  const domain = row.publisher || "";
  const impressions = parseInt(row.impressions, 10) || 0;
  const fileSizeKB = parseInt(row.file_size_kb, 10) || 0;

  // First do naive base CO2
  let co2 = measureBaseCarbon(impressions, fileSizeKB);

  // Check if domain is green from TheGreenWebFoundation
  const isGreen = await checkIfGreen(domain);
  if (isGreen) {
    // for example, reduce CO2 by 20% if domain is green
    co2 = co2 * 0.8;
  }

  // return final co2
  return {
    co2_kg: co2.toFixed(3),
    isGreen
  };
}

export default function App() {
  const [results, setResults] = useState([]);

  const handleFileUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const text = await file.text(); // read the CSV
    const rows = parseCSV(text);

    // We'll process each row in sequence for simplicity
    let finalRows = [];
    for (let row of rows) {
      const { co2_kg, isGreen } = await measureRow(row);
      finalRows.push({
        ...row,
        co2_kg,
        hosting_green: isGreen ? "Yes" : "No"
      });
    }
    setResults(finalRows);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, color: "#2E7D32" }}>AdVerde MVP with Greencheck</h1>
      <p>Upload a CSV with headers like:</p>
      <pre>publisher,file_size_kb,geo_location,impressions</pre>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginTop: 10 }}
      />

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Carbon Results (with GreenCheck API)</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
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
