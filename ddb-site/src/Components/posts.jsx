import React from "react";

export function Posts({
  posts,
  choosedData,
  setChoosedData,
  openWindow,
  setOpenWindow,
}) {
  const nopoststyles = {
    fontSize: "clamp(10px, 7vw, 50px)",
  };

  const containerNonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // если постов нет
  if (!posts || posts.length === 0) {
    return (
      <article style={containerNonStyle} className="website__postbox">
        <aside className="website__postbox__wrapper">
          <p style={nopoststyles}>Хабархо вучуд надоранд !</p>
        </aside>
      </article>
    );
  }

  return (
    <article className="website__postbox">
      <aside className="website__postbox__wrapper">
        {posts.map((post) => (
          <div
            key={post.id}
            className="website__post"
            onClick={() => {
              setChoosedData(post);
              setOpenWindow(true);
            }}
          >
            <PostContent post={post} />
          </div>
        ))}
      </aside>
    </article>
  );
}

// компонент для содержимого поста
function PostContent({ post }) {
  return (
    <>
      <div className="website__post__top">
        <h6 className="website__post__top__name">{post.name}</h6>
      </div>
      <div className="website__post__bottom">
        <div className="website__post__bottom__topblock">
          <h5 className="website__post__bottom__topblock__descr">
            {post.descr}
          </h5>
        </div>
        <div className="website__post__bottom__bottomblock">
          <div className="website__post__bottom__bottomblock__left">
            <img
              className="website__post__bottom__bottomblock__left__comment"
              src="/post/comment.png"
              alt="comment"
            />
            <img
              className="website__post__bottom__bottomblock__left__save"
              src="/post/save.png"
              alt="save"
            />
          </div>
          <div className="website__post__bottom__bottomblock__right">
            <img
              className="website__post__bottom__bottomblock__right__share"
              src="/post/share.png"
              alt="share"
            />
          </div>
        </div>
      </div>
      {post.imagePath && (
        <img
          className="website__post__bg"
          src={`/uploads/${post.imagePath}`}
          alt="bg"
        />
      )}
    </>
  );
}
