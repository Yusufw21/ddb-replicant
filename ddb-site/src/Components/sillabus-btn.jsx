import { Link } from "react-router-dom";

export default function SillabusMapBtn() {
  return (
    <>
      <Link to="/syllabus" className="sillabus-button">
        <span className="sillabus-button__text">Силабусхо</span>
      </Link>
    </>
  );
}
