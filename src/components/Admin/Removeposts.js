import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firebase setup
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

function AdminRemovePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, "posts"));
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        alert("Failed to load posts.");
      }
    };

    fetchPosts();
  }, []);

  
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        setPosts(posts.filter((post) => post.id !== postId));
        alert("Post deleted successfully.");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post.");
      }
    }
  };

  return loading ? (
    <p>Loading posts...</p>
  ) : (
    <div>
      <h1>Manage Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: "20px" }}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>Posted by: {post.authorName}</p>
              <button onClick={() => handleDeletePost(post.id)}>Delete Post</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminRemovePosts;
