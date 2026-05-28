import type { Coords } from "../../models/ubi.model";
export const LocationFilter = ({
  setLocation,
  location
}: {
  setLocation: (location: Coords | null) => void;
  location: Coords | null;
}) => {
  const handleLocation = () => {
    console.log("handleLocation", location);
    if (location) return setLocation(null);
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error al obtener las coordenadas del usuario", error);
        setLocation(null);
      },
    );
  };

  return (
    <>
      <div>
        <button
          title="Se mostraran las estaciones cercanas a tu ubicación"
          onClick={handleLocation}
          className=" h-min rounded-xl cursor-pointer hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={location ? 2 : 1.5}
            stroke="currentColor"
            className={`size-6  ${location ? "text-emerald-500" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
        </button>
      </div>
    </>
  );
};
