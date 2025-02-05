import "../index.css";
// import cardImage from "../assets/upload.svg";
import cardData from "./cardData";

export default function Card({ item }) {
  return (
    <section>
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm ">
        <a href="#">
          <img
            className="rounded-t-lg"
            src={`../src/assets/${item.image}`}
            alt="upload image"
          />
        </a>
        <div className=" max-w-sm dark:bg-gray-800 dark:border-gray-700 ">
          <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {item.title}
            </h5>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {item.description}
          </p>
        </div>
      </div>
      ;
    </section>
  );
}
