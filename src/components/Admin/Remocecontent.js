import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Firestore instance
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Removecontent = () => {
  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    // Fetch user role and check if admin
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDocs(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === "admin"); // Assume role is stored as "admin" for admin users
        }
      }
    };

    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    };

    checkAdminRole();
    fetchPosts();
  }, [auth]);

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      alert("Post removed successfully.");
      // Update the posts list after deletion
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error removing post:", error);
      alert("Failed to remove the post. Please try again.");
    }
  };

  if (!isAdmin) {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Manage Posts</h2>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <table className="post-table">
          <thead>
            <tr>
              <th>Post Title</th>
              <th>Author</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.author}</td>
                <td>
                  <button onClick={() => handleDeletePost(post.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Removecontent;
