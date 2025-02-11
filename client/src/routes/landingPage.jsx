import React, { useState, useEffect, useRef } from "react";

import "../index.css";
import heroImage from "../assets/hero2.svg";
import Card from "../components/card";
import cardData from "../components/cardData";
import Privacy from "../components/privacy";
import Timeline from "../components/timeline";
import Footer from "../components/footer";
import { FileUpload } from "../components/upload";

function Modal({ show, onClose, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (show) {
      modalRef.current?.focus();
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 opacity-99"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-slate-700 rounded-lg p-10 shadow-lg transform scale-95 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
          onClick={onClose}
          aria-label="Close Modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Content */}

        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const buttonRef = useRef(null);

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    buttonRef.current?.focus(); // Restore focus to the button
  };

  return (
    <>
      <section className="flex flex-col text-center md:text-left md:flex-row gap-3 h-screen bg-[#183b25] p-3 text-stone-50 items-center">
        <div className="flex-1">
          <h1 className="text-5xl my-8">
            Analyze Your <br /> M-Pesa Statements
          </h1>
          <h2 className="text-base md:text-xl">
            Effortlessly analyze your spending, track expenses, and gain
            valuable financial insights.
          </h2>
          <button
            className="mt-5 p-[3px] relative"
            ref={buttonRef}
            onClick={handleModalOpen}
          >
            <div className="absolute inset-0 bg-gradient-to-r bg-gray-800 to-emerald-500 to-90% rounded-lg" />
            <div className="px-8 py-2 dark:bg-gray-800 rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
              Upload Now
            </div>
          </button>
          <Modal show={showModal} onClose={handleModalClose}>
            {/* Your form content goes here */}
            <FileUpload />
          </Modal>
        </div>
        <div className="flex-1 w-80 md:h-150">
          <img
            src={heroImage}
            alt="hero image showing someone doing some analysis"
          />
        </div>
      </section>

      <section className="flex flex-col-reverse items-center justify-center md:flex-row gap-20">
        {cardData.map((data) => {
          return <Card key={data.id} item={data} />;
        })}
      </section>

      <section>
        <Timeline />
      </section>

      <section>
        <Privacy />
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}
