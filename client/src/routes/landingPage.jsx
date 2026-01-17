import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import heroImage from "../assets/hero2.svg";
import { FileUpload } from "../components/upload";
import { mockMpesaData } from "../data/mockData";

function Modal({ show, onClose, children }) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (show) {
      modalRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-white/10 rounded-2xl p-10 relative max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function LandingPage({ setMpesaData }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const handleDemoMode = () => {
    // 2. This will now work because setMpesaData is defined as a prop
    setMpesaData(mockMpesaData);

    // The App.jsx 'key' logic will now detect the change and
    // redirect you to /dashboard automatically.
  };
  return (
    <>
      <section className="flex flex-col text-center md:text-left md:flex-row gap-3 h-screen bg-[#183b25] p-3 text-stone-50 items-center overflow-hidden">
        <div className="flex-1 md:pl-20">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Analyze Your <br /> <span className="text-emerald-400">M-Pesa</span>{" "}
            Statements
          </h1>
          <p className="text-stone-300 mt-6 text-lg max-w-xl">
            Upload your statement to see your financial pulse, track recipients,
            and identify recurring expenses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="px-10 py-4 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
            >
              Upload Statement
            </button>

            <button
              onClick={handleDemoMode}
              className="px-10 py-4 bg-slate-800/50 border border-white/10 rounded-lg text-slate-300 font-bold hover:bg-slate-700 transition"
            >
              Try Demo Version
            </button>
          </div>
          <Modal show={showModal} onClose={() => setShowModal(false)}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Import Statement
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Safaricom PDF Statement
              </p>
            </div>

            <FileUpload
              onUploadSuccess={(response) => {
                const rawList = Array.isArray(response)
                  ? response
                  : response.data || [];

                if (rawList.length > 0) {
                  const formattedData = rawList.map((item) => {
                    // 1. Map Summary Names to include Colons and Caps (JSON 1 format)
                    const nameMapping = {
                      "Cash Out": "AGENT WITHDRAWAL:",
                      "Send Money": "SEND MONEY:",
                      "B2C Payment": "RECEIVED MONEY:",
                      "Pay Bill": "LIPA NA M-PESA (PAYBILL):",
                      "Cash In": "AGENT DEPOSIT:",
                      "Customer Merchant Payment":
                        "LIPA NA M-PESA (BUY GOODS):",
                      "Customer Airtime Purchase": "AIRTIME PURCHASE:",
                      "FSI Withdraw": "M-SHWARI WITHDRAW:",
                      "FSI Deposit": "M-SHWARI DEPOSIT:",
                      "TOTAL:": "TOTAL:",
                    };

                    const rawType =
                      item["TRANSACTION TYPE"] ||
                      item["Transaction Type"] ||
                      "";
                    const mappedType =
                      nameMapping[rawType] ||
                      rawType.toUpperCase() +
                        (rawType.endsWith(":") ? "" : ":");

                    // 2. Fix the "Receipt No" Key (Detect missing dot)
                    const receiptId =
                      item["Receipt No."] ||
                      item["Receipt No"] ||
                      item["Receipt"];

                    // 3. Amount Formatter (Cleans newline keys like "Withdraw\nn" and handles empty zeros)
                    const cleanAmount = (val) => {
                      if (!val || val === "0.00" || val === "0") return "";
                      return String(val).trim();
                    };

                    if (!receiptId) {
                      // --- SUMMARY ROW MAPPING ---
                      return {
                        "TRANSACTION TYPE": mappedType,
                        "PAID IN": item["PAID IN"] || item["Paid in"] || "0.00",
                        "PAID OUT":
                          item["PAID OUT"] || item["Withdraw\nn"] || "0.00",
                      };
                    } else {
                      // --- TRANSACTION ROW MAPPING ---
                      return {
                        "Receipt No.": receiptId, // Standardized key for Overview filter
                        "Completion Time":
                          item["Completion Time"] || item["Date"] || "",
                        Details: item["Details"] || "",
                        "Transaction Status":
                          item["Transaction Status"] || "Completed",
                        "Paid In": cleanAmount(
                          item["Paid in"] || item["Paid In"]
                        ),
                        Withdrawn: cleanAmount(
                          item["Withdraw\nn"] || item["Withdrawn"]
                        ),
                        Balance: item["Balance"] || "0.00",
                      };
                    }
                  });

                  // DEBUG LOGS to confirm mapping worked
                  console.log("✅ Adapted Row 0:", formattedData[0]);
                  console.log("✅ Adapted Row 10:", formattedData[10]);

                  localStorage.setItem(
                    "mpesaData",
                    JSON.stringify(formattedData)
                  );
                  setMpesaData(formattedData);
                  navigate("/dashboard");
                }
              }}
              onUploadError={(err) => alert("Upload failed: " + err)}
            />
          </Modal>
        </div>
        <div className="flex-1 w-full flex justify-center items-center p-10">
          <img
            src={heroImage}
            className="max-h-[70vh] drop-shadow-2xl"
            alt="Hero"
          />
        </div>
      </section>
    </>
  );
}
