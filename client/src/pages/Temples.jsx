import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Temples() {
  const [temples, setTemples] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch temples
  const fetchTemples = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/temples", { params });

      const templeData = res.data.temples || [];

      setTemples(templeData);
      setTotal(res.data.total || 0);
      setSuggestions(templeData.slice(0, 5)); // top 5 suggestions
    } catch (err) {
      setTemples([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTemples();
  }, [fetchTemples]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTemples(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query, fetchTemples]);

  const handleSelectTemple = (temple) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/temples/${temple._id}`);
  };

  return (
    <div className="page-container page-enter">
      <div className="section-header" style={{ textAlign: "center" }}>
        <h2>🛕 Explore Sacred Temples</h2>
        <p style={{ maxWidth: 560, margin: "0.5rem auto 0" }}>
          {total > 0
            ? `${total} temples across India — browse, discover, and plan your divine darshan`
            : "Discover sacred temples near you"}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
        <input
          className="form-control"
          placeholder="Search temples by name, location, or deity..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* SUGGESTIONS DROPDOWN */}
        {query && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "45px",
              width: "100%",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
              zIndex: 10,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s._id}
                onClick={() => handleSelectTemple(s)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f3f3"
                }}
              >
                🛕 {s.name}
                <div style={{ fontSize: "0.8rem", color: "#777" }}>
                  📍 {s.location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TEMPLE GRID */}
      {loading ? (
        <LoadingSpinner text="Loading temples..." />
      ) : temples.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏛️</div>
          <h3>No temples found</h3>
          <p>
            {query
              ? "Try a different search term"
              : "Temples will appear here once added by admins"}
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {temples.map((t) => (
            <div className="temple-card-wrapper" key={t._id}>
              <Link
                to={`/temples/${t._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card temple-explore-card">
                  <div className="card-image">
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        loading="lazy"
                      />
                    ) : (
                      "🛕"
                    )}
                  </div>

                  <div className="card-body">
                    <h4 className="card-title">{t.name}</h4>

                    <div className="card-subtitle">📍 {t.location}</div>

                    {t.deity && (
                      <div className="card-subtitle">
                        🙏 {t.deity}
                      </div>
                    )}

                    {t.description && (
                      <p
                        className="card-text"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {t.description}
                      </p>
                    )}
                  </div>

                  <div className="card-footer">
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-tertiary)"
                      }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}