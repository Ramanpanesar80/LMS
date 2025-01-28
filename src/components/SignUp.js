import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import "./Signup.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    address: "",
    dateOfBirth: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, email, address, dateOfBirth, mobileNumber, password, confirmPassword } =
      formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
        await setDoc(doc(db, "students", userId), {
        uid: userId,
        name: firstName,
        email: email,
        address: address,
        dateOfBirth: dateOfBirth,
        mobileNumber: mobileNumber,
      });

      setSuccess("Account created successfully!");
      setError("");

      navigate("/studentdash"); 
    } catch (error) {
      setError(error.message);
      setSuccess("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup1">
        <div className="signup-form">
          <h2>Create a Student Account</h2>
          {error && <p className="error-messaget">{error}</p>}
          {success && <p className="success-messaget">{success}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="firstName1">Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <div className="date-mobile1">
              <div>
                <label htmlFor="dateOfBirth">Date Of Birth:</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="password-row">
              <div>
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="checkboxll">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="/terms">terms and conditions</a>.
              </label>
            </div>
            <button type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
