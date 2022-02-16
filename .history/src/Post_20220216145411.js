import { Avatar, Skeleton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import "./Post.css";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    margin: theme.spacing(2),
  },
  media: {
    height: 190,
  },
}));

function Post({ postId, user, username, caption, imageURL }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let unsubscribe;
    const timer = setTimeout(() => {
      if (postId) {
        const postsRef = collection(db, "posts");
        const docRef = doc(postsRef, postId);
        const commentsRef = query(
          collection(docRef, "comments"),
          orderBy("timestamp", "desc")
        );

        unsubscribe = onSnapshot(commentsRef, (snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });

        // db.collection('posts').
        //   .doc(postId)
        //   .collection("comments")
        //   .orderBy("timestamp", "desc")
        //   .onSnapshot((snapshot) => {
        //     setComments(snapshot.docs.map((doc) => doc.data()));
        //   });
      }
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [postId]);

  const postComment = (event) => {
    event.preventDefault();

    const dbComment = collection(db, "posts");
    const docAddComment = doc(dbComment, postId);

    addDoc(collection(docAddComment, "comments"), {
      text: comment,
      username: user.displayName,
      timestamp: serverTimestamp(),
    });

    // db.collection("posts").doc(postId).collection("comments").add({
    //   text: comment,
    //   username: user.displayName,
    //   timestamp: serverTimestamp(),
    // });
    setComment("");
  };
  return (
    <div className="post">
      {/* header --> avatar + username */}
      <div className="post__header">
        {loading ? (
          <Skeleton
            animation="wave"
            variant="circle"
            width={40}
            height={40}
          ></Skeleton>
        ) : (
          <Avatar
            className="post__avatar"
            alt={username}
            src="/static/images/avatar/1.jpg"
          />
        )}
        {loading ? (
          <Skeleton
            animation="wave"
            height={10}
            width="50%"
            style={{ marginBottom: 6, marginLeft: 10 }}
          />
        ) : (
          <h3>{username}</h3>
        )}
      </div>

      {/* username + caption */}
      {loading ? (
        <Skeleton
          animation="wave"
          height={20}
          width="50%"
          style={{ marginLeft: 70, marginBottom: 40 }}
        ></Skeleton>
      ) : (
        <h4 className="post__text">{caption}</h4>
      )}
      {/* images */}
      {loading ? (
        <Skeleton animation="wave" variant="rect" className={classes.media} />
      ) : (
        <img className="post__image" src={imageURL} alt="" />
      )}

      <div className="post__comments">
        {loading ? (
          <Skeleton
            animation="wave"
            height={20}
            width="50%"
            style={{ marginLeft: 50 }}
          ></Skeleton>
        ) : (
          comments.map((comment, index) => (
            <p key={index}>
              <strong>{comment.username}:</strong> {comment.text}
            </p>
          ))
        )}
      </div>

      {user && (
        <form className="post__commmentBox">
          <input
            className="post__input"
            type="text"
            placeholder="Enter your comments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="post__button"
            disable="false"
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
