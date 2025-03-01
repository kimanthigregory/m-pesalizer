import "../index.css";
// import cardImage from "../assets/upload.svg";
import cardData from "./cardData";

export default function Card({ item }) {
  return (
    <section>
      <div className=" mt-7 max-w-80 h-90 bg-white border border-gray-200 rounded-lg shadow-sm ">
        <a href="#">
          <img
            className="rounded-t-lg h-50"
            src={`../src/assets/${item.image}`}
            alt="upload image"
          />
        </a>
        <div className="p-3  rounded-b-lg max-w-sm h-40 dark:bg-gray-800 dark:border-gray-700 ">
          <a href="#">
            <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900 dark:text-white">
              {item.title}
            </h5>
          </a>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {item.description}
          </p>
        </div>
      </div>
    </section>
  );
}
