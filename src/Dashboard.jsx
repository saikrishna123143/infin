import { useState } from "react";

export default function Dashboard({ providersData, setProvidersData, openView }) {
  const [excelText, setExcelText] = useState("");

  // ✅ Normalize insurance values
  function normalizeInsurance(value) {
    const v = (value || "").trim().toLowerCase();

    if (v === "uhc" || v.includes("united")) return "UHC";
    if (v === "humana") return "Humana";
    if (v === "ambetter") return "Ambetter";
    if (v === "medicare") return "Medicare";

    return "Other";
  }

  // ✅ Portal mapping
  function getPortalName(provider) {
    if (provider === "Humana") return "Availity";
    if (provider === "Ambetter") return "Ambetter";
    if (provider === "UHC") return "UHC";
    if (provider === "Medicare") return "Availity";
    return "BLACK";
  }

  // ✅ Generate note content
  function generateNote(provider) {
    // Medicare special format
    if (provider === "Medicare") {
      return `Checked on Availity web portal found the benefits which are as follows,
 Insurance primary: Yes,
Tax id: ,
 Network Status: In-Network, 
Effective Date:  - no term date (Calendar Year), 
Plan Type: Medicare Part B, 
Co-Insurance: 20%, 
Individual DED: $283, Met: $, REM: $ , 
Therapy Cap Amount: $2480, USED: $, Rem:$,
 Visit limit: Based on medical necessity, 
Home Health Care: No,
 Hospice: No, 
Skilled Nursing Care: No, 
Referral required: No, 
Auth Required: No,
 Tele Health: NA`;
    }

    // UHC / Humana / Ambetter
    if (provider === "Humana" || provider === "Ambetter" || provider === "UHC") {
      return `Checked on ${getPortalName(provider)} portal found the benefits which are as follows,
Network status: In-network
This is Primary Insurance
- Effective Date:
- No term date (Calendar year)
- Plan type:
- Co-pay: $
- Co-ins: %
- Individual Deductible: $ Met: $ Remaining: $
- Individual OOP: $ Met: $ Remaining: $
- Family Deductible: $ Met: $ Remaining: $
- Family OOP: $ Met: $ Remaining: $
- Visits: Met: Remaining:
- Auth required:
- Referral required:
- Telehealth: Yes( )
- HSA:
- HRA:
- call refer:`;
    }

    // Other
    return `Checked on --- portal found the benefits which are as follows,
Network status: In-network
This is Primary Insurance
- Effective Date:
- No term date (Calendar year)
- Plan type:
- Co-pay: $
- Co-ins: %
- Individual Deductible: $ Met: $ Remaining: $
- Individual OOP: $ Met: $ Remaining: $
- Family Deductible: $ Met: $ Remaining: $
- Family OOP: $ Met: $ Remaining: $
- Visits: Met: Remaining:
- Auth required:
- Referral required:
- Telehealth: Yes( )
- HSA:
- HRA:
- call refer:`;
  }

  // ✅ Parse pasted data (your format: many columns)
  // Takes:
  //   Case ID = FIRST column
  //   Insurance = LAST column
  function parseExcelText(text) {
    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length < 1) return [];

    return lines
      .map(line => {
        const parts = line.split("\t").map(x => x.trim()).filter(Boolean);

        const caseId = parts[0] || "";
        const insurance = parts[parts.length - 1] || "";

        return { caseId, insurance };
      })
      .filter(r => r.caseId && r.insurance);
  }

  // ✅ Generate notes from pasted table
  function handleGenerateFromExcel() {
    const rows = parseExcelText(excelText);
    if (rows.length === 0) return;

    setProvidersData(prev => {
      const updated = { ...prev };

      rows.forEach(row => {
        const provider = normalizeInsurance(row.insurance);

        const note = {
          caseId: row.caseId,
          insurance: provider,
          content: generateNote(provider),
          status: "IN_PROGRESS"
        };

        updated[provider] = [...(updated[provider] || []), note];
      });

      return updated;
    });

    setExcelText("");
  }

  // ✅ Download all notes (single line each)
 function downloadAllNotes() {
  let text = "";

  const providersOrder = ["UHC", "Humana", "Ambetter", "Medicare", "Other"];

  providersOrder.forEach(provider => {
    const notes = providersData[provider] || [];
    if (notes.length === 0) return;

    text += `============================================================\n`;
    text += `PROVIDER: ${provider}\n`;
    text += `============================================================\n\n`;

    notes.forEach((note, index) => {
      text += `NOTE #${index + 1}\n`;
      text += `Case ID   : ${note.caseId}\n`;
      text += `Insurance : ${note.insurance || provider}\n`;
      text += `Status    : ${note.status}\n`;
      text += `------------------------------------------------------------\n`;
      text += `${note.content}\n`;
      text += `------------------------------------------------------------\n\n\n\n\n\n`;
    });

    text += `\n\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "insurance-notes.txt";
  a.click();
  URL.revokeObjectURL(url);
}


  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Insurance Dashboard
        </h1>

        <button
          onClick={downloadAllNotes}
          className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white"
        >
          ⬇ Download All Notes
        </button>
      </div>

      {/* INPUT */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Paste Data (Case ID + Last Column Insurance)
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          Paste your copied table here. It will take:
          <br />
          <b>Case ID = 1st column</b> and <b>Insurance = last column</b>
        </p>

        <textarea
          value={excelText}
          onChange={e => setExcelText(e.target.value)}
          placeholder={`upf2-1831898\t...\tAmbetter\nupf2-1837907\t...\tMedicare\nupf1-1493253\t...\tCigna`}
          className="w-full border p-3 rounded h-52 font-mono text-sm"
        />

        <button
          onClick={handleGenerateFromExcel}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Generate Notes
        </button>
      </div>

      {/* PROVIDER FILTERS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          View Notes By Provider
        </h2>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => openView("ALL")}
            className="px-4 py-2 bg-slate-900 text-white rounded"
          >
            All Providers
          </button>

          {["UHC", "Humana", "Ambetter", "Medicare", "Other"].map(p => (
            <button
              key={p}
              onClick={() => openView(p)}
              className="px-4 py-2 border rounded"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
