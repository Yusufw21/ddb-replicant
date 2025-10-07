import { useState, useEffect } from "react";
import { useMediaQuery } from "./Hooks/media_query";
import { Header } from "./Components/header";
import { Menu } from "./Components/menu";
import AdminPanel from "./Admin/admin";
import { Routes, Route } from "react-router-dom";
import { Posts } from "./Components/posts";
import LoginScreen from "./Login/login";
import PostView from "./Components/postview";
import EditPosts from "./EditPost/editpost";
import PostsTitle from "./Components/posts_title";
import LessonsMap from "./LessonsMap/LessonsMap";
import LessonsMapBtn from "./Components/lessonsMap_btn";
import ForgotPasswordSite from "./Components/forgotPasswordSite";
import SillabusMapBtn from "./Components/sillabus-btn";
import Syllabus from "./Syllabus/syllabus";
import SyllabusEditFull from "./Sylabus_Edits/syllabus_edits";

export default function App() {
  const isDesktop = useMediaQuery("(min-width: 1060px)");
  const isTablet = useMediaQuery("(min-width: 620px) and (max-width: 1059px)");
  const isMobile = useMediaQuery("(max-width: 619px)");
  const [menu, setMenu] = useState(false);

  const [posts, setPosts] = useState([]); // <-- Состояние для постов
  const [error, setError] = useState("");
  const [choosedData, setChoosedData] = useState(null);
  const [openWindow, setOpenWindow] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Ошибка при получении постов");
        }

        setPosts(data);
      } catch (err) {
        console.log(err);
        setError("Не удалось загрузить посты");
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="website">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header
                isDesktop={isDesktop}
                isMobile={isMobile}
                isTablet={isTablet}
                menu={menu}
                setMenu={setMenu}
              />
              <Menu menu={menu} />
              <PostsTitle />
              <Posts
                posts={posts}
                choosedData={choosedData}
                setChoosedData={setChoosedData}
                openWindow={openWindow}
                setOpenWindow={setOpenWindow}
              />
              <PostView
                choosedData={choosedData}
                setChoosedData={setChoosedData}
                posts={posts}
                openWindow={openWindow}
                setOpenWindow={setOpenWindow}
              />
              <LessonsMapBtn />
              <SillabusMapBtn />
            </>
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/editpost"
          element={<EditPosts posts={posts} setPosts={setPosts} />}
        />
        <Route path="/lessonsMap" element={<LessonsMap />} />
        <Route path="/forgotsite" element={<ForgotPasswordSite />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/syllabusEdits" element={<SyllabusEditFull />} />
      </Routes>
    </div>
  );
}
