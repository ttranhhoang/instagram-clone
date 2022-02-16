import { Button, Input, Avatar, Modal } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import "./App.css";
import { auth, db } from "./firebase";
import ImageUpload from "./ImageUpload";
import Post from "./Post";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // user đã đăng nhập
        console.log(authUser);
        setUser(authUser);
      } else {
        //user đã đăng xuất
        setUser(null);
      }
    });
    return () => {
      // xuất hiện hành động làm mới
      unsubscribe();
    };
  }, [user, username]);

  // Use effect runs a piece of code based on a specific condition
  useEffect(() => {
    // this is where the code run
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, orderBy("timestamp", "desc"));

    onSnapshot(postsQuery, (snapshot) => {
      // mỗi lần posts dc thêm mới vào thì code sẽ chạy lại trang
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          post: doc.data(),
        }))
      );
      // }).onSnapshot((snapshot) => {
      //   // mỗi lần posts dc thêm mới vào thì code sẽ chạy lại trang
      //   setPosts(
      //     snapshot.docs.map((doc) => ({
      //       id: doc.id,
      //       post: doc.data(),
      //     }))
      //   );
    });
  }, []);

  const signUp = (event) => {
    event.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
      .then((authUser) => {
        updateProfile(authUser.user, {
          displayName: username,
        });
        // return authUser.user;
        // authUser.user.updateProfile({
        //   displayName: username,
        // });
      })
      .catch((error) => alert(error.message));

    setOpen(false);
  };

  const signIn = (event) => {
    event.preventDefault();

    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      alert(error.message)
    );

    setOpenSignIn(false);
  };
  return (
    <div className="app">
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img className="app__headerImage" src="./images" alt="" />
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>
              Sign Up
            </Button>
          </form>
        </div>
      </Modal>

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img className="app__headerImage" src="./images.png" alt="" />
            </center>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>
              Sign In
            </Button>
          </form>
        </div>
      </Modal>

      {/*header*/}
      <div className="app__header">
        <a href="./App.js">
          <img
            className="app__headerImage"
            src="https://freepngimg.com/save/118534-logo-insta-free-download-png-hd/640x229"
            alt=""
          />
        </a>

        {/* nút sigin signup logout */}
        {user ? (
          <Button onClick={() => auth.signOut()}>
            {" "}
            LogOut
            <Avatar
              className="post__avatar"
              alt={user.displayName}
              src="/static/images/avatar/1.jpg"
            />
          </Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpenSignIn(true)}> Sign In </Button>
            <Button onClick={() => setOpen(true)}> Sign Up </Button>
          </div>
        )}
      </div>
      <div className="app__posts">
        {posts.map(({ id, post }) => (
          <Post
            key={id}
            postId={id}
            user={user}
            username={post.username}
            caption={post.caption}
            imageURL={post.imageURL}
          />
        ))}
      </div>

      {/* nơi đăng hình ảnh  caption*/}
      {user?.displayName ? (
        <ImageUpload username={user.displayName} />
      ) : (
        <h3 className="app__error">Bạn cần phải đăng nhập để đăng bài viết</h3>
      )}
    </div>
  );
}

export default App;
