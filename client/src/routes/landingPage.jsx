import "../index.css";
import heroImage from "../assets/hero2.svg";
import uploadImage from "../assets/upload-animate.svg";
import otpImage from "../assets/otp-animate.svg";
import Card from "../components/card";
import cardData from "../components/cardData";

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
      <section className="flex flex-col-reverse items-center justify-center md:flex-row gap-3 :flex-col">
        {cardData.map((data) => {
          return <Card key={data.id} item={data} />;
        })}
      </section>
      <section>
        <div className="m-3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-center font-semibold mb-4">
            How It Works
          </h2>
          <div className="relative">
            {" "}
            {/* Main timeline container */}
            {/* Vertical Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-1 bg-gray-300 w-1 hidden md:block"></div>{" "}
            {/* Hidden on smaller screens */}
            {/* Item 1 */}
            <div className=" md:flex md:items-center relative">
              {" "}
              {/* Relative for positioning the step number */}
              <div className="md:w-1/2">
                <div className="bg-blue-100 rounded-lg p-4 mb-2 md:mb-0">
                  <h3 className="text-xl font-medium mb-2">Upload Statement</h3>
                  <p className="text-gray-600">
                    Select your M-Pesa statement PDF from your device or drag
                    and drop it into the designated area
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8 flex items-center justify-center">
                <div className="w-100 h-100 flex items-center justify-center text-white relative">
                  {" "}
                  {/* Relative for absolute positioning */}
                  <img src={uploadImage} alt="upload" />
                </div>
                <span className="ml-4 text-2xl font-bold text-gray-300 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2">
                  1
                </span>{" "}
                {/* Center the number */}
              </div>
            </div>
            {/* Item 2 (flipped) */}
            <div className=" md:flex md:items-center md:flex-row-reverse relative">
              <div className="md:w-1/2">
                <div className="bg-green-100 rounded-lg p-4 mb-2 md:mb-0">
                  <h3 className="text-xl font-medium mb-2">
                    Enter Verification Code
                  </h3>
                  <p className="text-gray-600">
                    Enter the verification code you received via SMS after
                    requesting your M-Pesa statement. Click the submit button to
                    securely upload and process your statement
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 md:pr-8 flex items-center justify-center">
                <div className="w-100 h-100  flex items-center justify-center text-white relative">
                  <img src={otpImage} alt="enter password illustration" />
                </div>
                <span className="ml-4 text-2xl font-bold text-gray-300 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2">
                  2
                </span>{" "}
                {/* Center the number */}
              </div>
            </div>
            {/* Add more items here... */}
            <div className=" md:flex md:items-center relative">
              {" "}
              {/* Relative for positioning the step number */}
              <div className="md:w-1/2">
                <span className="ml-4 text-2xl font-bold text-gray-300 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2">
                  3
                </span>{" "}
                <div className="bg-blue-100 rounded-lg p-4 mb-2 md:mb-0">
                  <h3 className="text-xl font-medium mb-2">View Analysis</h3>
                  <p className="text-gray-600">
                    Once processed, you'll be redirected to your personalized
                    dashboard with detailed analysis of your M-Pesa transactions
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8 flex items-center justify-center">
                <div className="w-100 h-100 flex items-center justify-center text-white relative">
                  {" "}
                  {/* Relative for absolute positioning */}
                  <img src={uploadImage} alt="upload" />
                </div>
                {/* Center the number */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
