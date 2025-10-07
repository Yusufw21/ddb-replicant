import { Link } from "react-router-dom";

export default function LessonsMapBtn() {
  return (
    <>
      <Link to="/lessonsMap" className="map-button">
        <span className="map-button__text">Чадвалхои дарсхо</span>
      </Link>
    </>
  );
}
