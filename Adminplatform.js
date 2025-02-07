import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import "./platformsettings.css";

import { Link, useNavigate } from "react-router-dom";

const AdminManageSettings = () => {
  const [settings, setSettings] = useState({
    appearance: {
      theme: "light", 
      backgroundColor: "#ffffff", 
    },
    privacyPolicy: "",
  });

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsRef = doc(db, "settings", "platformSettings");
      try {
        const settingsSnapshot = await getDoc(settingsRef);
        if (settingsSnapshot.exists()) {
          setSettings(settingsSnapshot.data());
        } else {
          console.log("No settings found, creating a new document.");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        appearance: {
          ...prevSettings.appearance,
          theme: savedTheme,
        },
      }));
      document.body.className = savedTheme === "dark" ? "dark-theme" : "light-theme";
    } else {
      document.body.className = settings.appearance.theme === "dark" ? "dark-theme" : "light-theme";
    }

    const savedBgColor = localStorage.getItem("backgroundColor");
    if (savedBgColor) {
      document.body.style.backgroundColor = savedBgColor;
    }
  }, []); // Only run once on mount

  useEffect(() => {
    document.body.className = settings.appearance.theme === "dark" ? "dark-theme" : "light-theme";
  }, [settings.appearance.theme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        appearance: {
          ...prevSettings.appearance,
          [name]: value,
        },
      };

      if (name === "theme") {
        localStorage.setItem("theme", value);
        document.body.className = value === "dark" ? "dark-theme" : "light-theme";
      } else if (name === "backgroundColor") {
        document.body.style.backgroundColor = value;
        localStorage.setItem("backgroundColor", value);
      }

      return updatedSettings;
    });
  };

  const handleSave = async () => {
    const settingsRef = doc(db, "settings", "platformSettings");

    try {
      await setDoc(
        settingsRef,
        {
          appearance: settings.appearance,
          privacyPolicy: settings.privacyPolicy,
        },
        { merge: true }
      );

      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to update settings.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
      alert("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An error occurred while signing out. Please try again.");
    }
  };

  return (
    <div className="admin-container">
      <header className="list-header">
        <h1 className="preet-mana">Admin Dashboard</h1>
        <div className="button-list">
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar-admin">
        <ul>
          <li><Link to="/manage-users">Manage Users</Link></li>
          <li><Link to="/Admin-view">Admin View</Link></li>
          <li><Link to="/suspendstudent">Suspend Student</Link></li>
          <li><Link to="/removeposts">Remove Post</Link></li>
          <li><Link to="/flagged">Flagged content</Link></li>
          <li><Link to="/control">Admin Control</Link></li>
          <li><Link to="/permission">Admin permissions</Link></li>
          <li><Link to="/platform">Admin platform</Link></li>
          <li><Link to="/profile">Student profile set</Link></li>
        </ul>
      </nav>

      <h2>Manage Platform Settings</h2>

      <div className="appearance-settings">
        <h3>Appearance</h3>
        <div className="lc">
          <label>Theme:</label>
          <select
            name="theme"
            value={settings.appearance.theme}
            onChange={handleAppearanceChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label>Background Color:</label>
          <input
            type="color"
            name="backgroundColor"
            value={settings.appearance.backgroundColor}
            onChange={handleAppearanceChange}
          />
        </div>
      </div>

      <div className="privacy-policy-settings">
        <h3>Privacy Policy</h3>
        <textarea
          name="privacyPolicy"
          value={settings.privacyPolicy}
          onChange={handleInputChange}
          placeholder="Enter your privacy policy here..."
          rows="5"
        />
      </div>

      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default AdminManageSettings;
