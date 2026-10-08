import React from "react";
import { useRef, useState } from "react";
import { Upload, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const resources = ["Canteen", "Amul", "Snackify", "Nescafe"];

export default function CheckNow() {
  const inputRef = useRef(null);
  const [resource, setResource] = useState("Canteen");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function chooseFile(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  }

  async function analyze() {
    if (!file) return;

    setLoading(true);

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("resource", resource);

      const res = await api.post("/predictions/image", form);
      setResult(res.data);
    } catch (e) {
      alert(e.response?.data?.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ON-THE-SPOT AI</span>
          <h1>What does it look like right now?</h1>
          <p>Upload a current photo and let the crowd model assess it.</p>
        </div>
      </div>

      <section className="check-layout">
        <div className="upload-card">
          <div className="form-label">1. Choose a spot</div>
          <select
            className="select"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
          >
            {resources.map((x) => <option key={x}>{x}</option>)}
          </select>

          <div className="form-label upload-label">2. Add a photo</div>

          <div
            className={`drop-zone ${preview ? "has-image" : ""}`}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Selected" />
            ) : (
              <>
                <div className="upload-icon"><Upload size={22} /></div>
                <strong>Drop a campus image here</strong>
                <span>or click to browse · JPG / PNG</span>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={chooseFile}
            hidden
          />

          <button
            className="primary-button full"
            onClick={analyze}
            disabled={!file || loading}
          >
            <Camera size={17} />
            {loading ? "Analyzing..." : "Analyze crowd"}
          </button>
        </div>

        <div className="result-card">
          {!result ? (
            <div className="empty-result">
              <div className="result-icon"><Camera size={22} /></div>
              <h3>Your result will appear here.</h3>
              <p>
                Upload a current image to get a Free, Moderate or Busy
                classification.
              </p>
            </div>
          ) : (
            <div className="result-content">
              <div className="result-icon success">
                <CheckCircle2 size={22} />
              </div>

              <span className="eyebrow">AI RESULT</span>
              <h2>{result.resource}</h2>

              <StatusBadge status={result.status} />

              <div className="big-score">
                {result.score}<span>%</span>
              </div>

              <p className="confidence">
                Model confidence: {(result.confidence * 100).toFixed(1)}%
              </p>

              <div className="recommendation">
                <strong>
                  {result.status === "Busy" ? "Not ideal right now." : "Looks good."}
                </strong>
                <span>{result.recommendation}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="info-note">
        <AlertCircle size={16} />
        <span>
          The current demo uses a model adapter. Connect the trained
          MobileNetV2/CNN service before using this as a real campus predictor.
        </span>
      </div>
    </div>
  );
}
