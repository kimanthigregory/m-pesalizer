import "../index.css";
import heroImage from "../assets/hero2.svg";
import Card from "../components/card";
import cardData from "../components/cardData";
import Privacy from "../components/privacy";
import Timeline from "../components/timeline";
import Footer from "../components/footer";

export default function LandingPage() {
  return (
    <>
      <section className="flex flex-col text-center md:text-left md:flex-row gap-3 :flex-col h-screen bg-[#183b25] p-3 text-stone-50 items-center">
        <div className="flex-1">
          <h1 className=" text-5xl my-8">
            Analyze Your <br /> M-Pesa Statements
          </h1>
          <h2 className="text-base md:text-xl">
            Effortlessly analyze your spending, track expenses, and gain
            valuable financial insights.
          </h2>
          <button className="mt-5 p-[3px] relative">
            <div className="absolute inset-0 bg-gradient-to-r bg-gray-800 to-emerald-500 to-90%  rounded-lg" />
            <div className="px-8 py-2  dark:bg-gray-800  rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
              Upload Now
            </div>
          </button>
        </div>
        <div className="flex-1 w-80 md:h-150">
          <img
            src={heroImage}
            alt="hero image showing someone doing some analysis"
          />
        </div>
      </section>
      <section className="flex flex-col-reverse items-center justify-center md:flex-row gap-20 :flex-col">
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
