import { useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function App() {

  // =========================
  // AUTH STATES
  // =========================

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState("");

  // =========================
  // MAIN APP STATES
  // =========================

  const [topic, setTopic] = useState("");

  const [videos, setVideos] = useState([]);

  const [keywords, setKeywords] = useState([]);

  const [generatedTitles, setGeneratedTitles] = useState([]);

  const [recentSearches, setRecentSearches] = useState([]);

  // =========================
  // SIGNUP
  // =========================

  const signupUser = async () => {

    try {

      const response = await axios.post(
        "https://trendtube-ai-backend.onrender.com",
        {
          username,
          email,
          password,
        }
      );

      alert(response.data.message);

      setIsLogin(true);

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // LOGIN
  // =========================

  const loginUser = async () => {

    try {

      const response = await axios.post(
        "https://trendtube-ai-backend.onrender.com/login",
        {
          email,
          password,
        }
      );

      alert(response.data.message);

      if (
        response.data.message === "Login successful"
      ) {
        setLoggedInUser(response.data.username);
      }

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // ANALYZE TOPIC
  // =========================

  const analyzeTopic = async () => {

    try {

      const response = await axios.get(
        `https://trendtube-ai-backend.onrender.com/analyze/${topic}`
      );

      setVideos(response.data.videos);

      setKeywords(response.data.keywords);

      setGeneratedTitles(
        response.data.generated_titles
      );

      setRecentSearches(
        response.data.recent_searches
      );

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // DOWNLOAD PDF REPORT
  // =========================

  const downloadReport = () => {

    window.open(
      "https://trendtube-ai-backend.onrender.com/download-report",
      "_blank"
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const logoutUser = () => {

    setLoggedInUser("");

    setEmail("");

    setPassword("");

    setUsername("");
  };

  // =========================
  // CHART DATA
  // =========================

  const chartData = videos.map((video) => ({
    name: video.title.substring(0, 10),
    score: video.viral_score,
  }));

  const sentimentData = [
    {
      name: "Positive",
      value: videos.filter((v) =>
        v.sentiment.includes("Positive")
      ).length,
    },
    {
      name: "Neutral",
      value: videos.filter((v) =>
        v.sentiment.includes("Neutral")
      ).length,
    },
    {
      name: "Negative",
      value: videos.filter((v) =>
        v.sentiment.includes("Negative")
      ).length,
    },
  ];

  // =========================
  // LOGIN / SIGNUP SCREEN
  // =========================

  if (!loggedInUser) {

    return (

      <div
        style={{
          backgroundColor: "#0f172a",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "Arial",
        }}
      >

        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "40px",
            borderRadius: "20px",
            width: "400px",
          }}
        >

          <h1
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            🚀 TrendTube AI
          </h1>

          {!isLogin && (

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              style={inputStyle}
            />

          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          {/* PASSWORD INPUT */}

          <div
            style={{
              position: "relative",
              marginBottom: "15px",
            }}
          >

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                ...inputStyle,
                marginBottom: "0px",
              }}
            />

            <button
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#2563eb",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {isLogin ? (

            <button
              onClick={loginUser}
              style={buttonStyle}
            >
              Login
            </button>

          ) : (

            <button
              onClick={signupUser}
              style={buttonStyle}
            >
              Signup
            </button>

          )}

          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() =>
              setIsLogin(!isLogin)
            }
          >

            {isLogin
              ? "New user? Signup"
              : "Already have account? Login"}

          </p>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (

    <div
      style={{
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <div>

          <h1 style={{ fontSize: "42px" }}>
            🚀 TrendTube AI
          </h1>

          <p style={{ color: "#94a3b8" }}>
            Welcome, {loggedInUser} 👋
          </p>

        </div>

        <button
          onClick={logoutUser}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>

      </div>

      {/* SEARCH SECTION */}

      <div style={{ marginTop: "30px" }}>

        <input
          type="text"
          placeholder="Search YouTube Topic..."
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          style={{
            padding: "15px",
            width: "60%",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
          }}
        />

        <button
          onClick={analyzeTopic}
          style={{
            padding: "15px 25px",
            marginLeft: "10px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Analyze
        </button>

        <button
          onClick={downloadReport}
          style={{
            padding: "15px 25px",
            marginLeft: "10px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#22c55e",
            color: "white",
            cursor: "pointer",
          }}
        >
          📄 Download Report
        </button>

      </div>

      {/* RECENT SEARCHES */}

      <div
        style={{
          marginTop: "30px",
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "15px",
        }}
      >

        <h2>🕒 Recent Searches</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >

          {recentSearches.map((search, index) => (

            <div
              key={index}
              style={{
                backgroundColor: "#334155",
                padding: "10px 15px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              {search}
            </div>

          ))}

        </div>

      </div>

      {/* TRENDING KEYWORDS */}

      <div
        style={{
          marginTop: "30px",
          marginBottom: "20px",
        }}
      >

        <h2>🔥 Trending Keywords</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >

          {keywords.map((word, index) => (

            <div
              key={index}
              style={{
                backgroundColor: "#2563eb",
                padding: "10px 15px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              #{word}
            </div>

          ))}

        </div>

      </div>

      {/* AI GENERATED TITLES */}

      <div
        style={{
          marginTop: "40px",
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "15px",
        }}
      >

        <h2>🧠 AI Generated Titles</h2>

        <div
          style={{
            marginTop: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >

          {generatedTitles.map((title, index) => (

            <div
              key={index}
              style={{
                backgroundColor: "#0f172a",
                padding: "15px",
                borderRadius: "10px",
                fontWeight: "bold",
                color: "#38bdf8",
              }}
            >
              {title}
            </div>

          ))}

        </div>

      </div>

      {/* ANALYTICS DASHBOARD */}

      <div
        style={{
          marginTop: "50px",
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >

        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
          }}
        >

          <h2>📈 Viral Score Analytics</h2>

          <BarChart
            width={500}
            height={300}
            data={chartData}
          >

            <XAxis
              dataKey="name"
              stroke="#ffffff"
            />

            <YAxis stroke="#ffffff" />

            <Tooltip />

            <Bar
              dataKey="score"
              fill="#2563eb"
            />

          </BarChart>

        </div>

        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
          }}
        >

          <h2>😊 Sentiment Analysis</h2>

          <PieChart width={300} height={300}>

            <Pie
              data={sentimentData}
              dataKey="value"
              outerRadius={100}
              fill="#8884d8"
              label
            >

              <Cell fill="#22c55e" />

              <Cell fill="#facc15" />

              <Cell fill="#ef4444" />

            </Pie>

          </PieChart>

        </div>

      </div>

      {/* VIDEO CARDS */}

      <div
        style={{
          marginTop: "40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >

        {videos.map((video, index) => (

          <div
            key={index}
            style={{
              backgroundColor: "#1e293b",
              padding: "15px",
              borderRadius: "15px",
              width: "300px",
            }}
          >

            <img
              src={video.thumbnail}
              alt="thumbnail"
              style={{
                width: "100%",
                borderRadius: "10px",
              }}
            />

            <h3 style={{ marginTop: "10px" }}>
              {video.title}
            </h3>

            <p style={{ color: "#94a3b8" }}>
              {video.channel}
            </p>

            <p
              style={{
                marginTop: "10px",
                color: "#22c55e",
                fontWeight: "bold",
              }}
            >
              🔥 Viral Score:
              {" "}
              {video.viral_score}%
            </p>

            <p
              style={{
                marginTop: "8px",
                color: "#facc15",
                fontWeight: "bold",
              }}
            >
              {video.sentiment}
            </p>

            <p
              style={{
                marginTop: "8px",
                color: "#38bdf8",
                fontWeight: "bold",
              }}
            >
              🎯 SEO Score:
              {" "}
              {video.seo_score}/100
            </p>

            <p
              style={{
                marginTop: "8px",
                color: "#f97316",
                fontWeight: "bold",
              }}
            >
              🖼 Thumbnail Score:
              {" "}
              {video.thumbnail_score}%
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
};

export default App;