export default function ProviderDetails({
  view,
  providersData,
  setProvidersData,
  goBack
}) {
  function toggleStatus(provider, index) {
    setProvidersData(prev => {
      const updated = prev[provider].map((note, i) =>
        i === index
          ? {
              ...note,
              status:
                note.status === "IN_PROGRESS"
                  ? "SUBMITTED"
                  : "IN_PROGRESS"
            }
          : note
      );

      return { ...prev, [provider]: updated };
    });
  }

  function updateNote(provider, index, value) {
    setProvidersData(prev => {
      const updated = prev[provider].map((note, i) =>
        i === index ? { ...note, content: value } : note
      );

      return { ...prev, [provider]: updated };
    });
  }

  function renderProvider(provider) {
    return (
      <div key={provider} className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{provider}</h2>

        {providersData[provider].map((note, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow mb-4"
          >
            {/* TOP INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
              <p><span className="font-medium">Case ID:</span> {note.caseId}</p>
              <p><span className="font-medium">Name:</span> {note.name}</p>
              <p><span className="font-medium">DOB:</span> {note.dob}</p>
              <p><span className="font-medium">Member ID:</span> {note.memberId}</p>
              <p><span className="font-medium">Tax ID:</span> {note.taxId}</p>

              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`font-semibold ${
                    note.status === "SUBMITTED"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {note.status}
                </span>
              </p>
            </div>

            {/* NOTE TEXTAREA */}
            <textarea
              className={`w-full border rounded p-2 text-sm h-48 font-mono ${
                note.status === "SUBMITTED" ? "bg-gray-100" : ""
              }`}
              value={note.content}
              disabled={note.status === "SUBMITTED"}
              onChange={e =>
                updateNote(provider, index, e.target.value)
              }
            />

            {/* ACTION BUTTON */}
            <button
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => toggleStatus(provider, index)}
            >
              {note.status === "IN_PROGRESS"
                ? "Submit"
                : "Reopen"}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        className="mb-6 text-blue-600 underline"
        onClick={goBack}
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-6">
        {view === "ALL"
          ? "All Providers"
          : `${view} Provider`} – Patient Notes
      </h1>

      {view === "ALL"
        ? Object.keys(providersData).map(renderProvider)
        : renderProvider(view)}
    </div>
  );
}
