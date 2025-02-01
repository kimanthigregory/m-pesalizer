import "../index.css";
import heroImage from "../assets/hero-image.svg";

export default function LandingPage() {
  return (
    <>
      <section className="flex flex-col-reverse md:flex-row gap-3 :flex-col bg-[#183b25] p-3 text-stone-50 items-center h-150 ">
        <div className="flex-1">
          <h1 className=" text-5xl my-8">
            Unleash the Power of Your M-Pesa Statements
          </h1>
          <h2 className="text-base">
            Effortlessly analyze your spending, track expenses, and gain
            valuable financial insights.
          </h2>
        </div>
        <div className="flex-1">
          <img
            src={heroImage}
            alt="hero image showing someone doing some analysis"
          />
        </div>
      </section>
    </>
  );
}
