import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const TeacherRouteGuard = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const checkTeacherAccess = async () => {
      const user = auth.currentUser;

      if (user) {
        const teacherDocRef = doc(db, "teacher", user.uid);
        const teacherDoc = await getDoc(teacherDocRef);

        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();

          if (teacherData.passwordChangeRequired) {
            // Redirect to password change page
            navigate("/change-password", { state: { userId: user.uid, email: user.email } });
          } else {
            // Grant access
            setAuthorized(true);
          }
        } else {
          navigate("/teacher-login");
        }
      } else {
        navigate("/teacher-login");
      }

      setLoading(false);
    };

    checkTeacherAccess();
  }, [auth, db, navigate]);

  if (loading) return <p>Loading...</p>;

  return authorized ? <Outlet /> : null;
};

export default TeacherRouteGuard;
