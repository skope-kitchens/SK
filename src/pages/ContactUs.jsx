import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

/* ---------------- SAFE STORAGE HELPERS ---------------- */

function storageAvailable() {
  try {
    const testKey = "__test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeGet(key) {
  if (!storageAvailable()) return null;

  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeGetJSON(key) {
  const val = safeGet(key);
  try {
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------ */

const ContactUs = () => {
  const [chefName, setChefName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD CHEF NAME ---------- */
  useEffect(() => {
    const fetchChef = async () => {
      try {
        const token = safeGet("skope_auth_token");
        if (!token) return;

        const res = await api.get("/api/brand/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChefName(res.data?.chefName || "");
      } catch (err) {
        console.error("[ContactUs] Failed to load chefName", err);
        setChefName("");
      }
    };

    fetchChef();
  }, []);

  const displayChefName = chefName || "Chef";

  /* ---------- SCHEDULE MEETING ---------- */

const handleSchedule = async (team) => {
  const token = safeGet("skope_auth_token");
  const user = safeGetJSON("skope_user");

  if (!token || !user) {
    alert("Please login first to schedule a meeting.");
    return;
  }

  const ok = window.confirm(
    "Do you really want to schedule this meeting?\n20 credits will be deducted."
  );

  if (!ok) return;

  try {
    setLoading(true);

    await api.post("/api/meeting/schedule", {
      name: user?.name || "User",
      email: user?.email || "",
      date: new Date().toISOString(),
      notes: `Meeting with ${team.team}`,
    });

    // redirect after success
    window.location.href = team.link;

  } catch (err) {
    console.error("Schedule error:", err);

    if (err?.response?.status === 400) {
      alert(err.response.data.message || "Insufficient credits.");
      return;
    }

    if (err?.response?.status === 401) {
      alert("Session expired. Please login again.");
      return;
    }

    alert("Something went wrong scheduling meeting.");
  } finally {
    setLoading(false);
  }
};



  /* ---------- APPOINTMENT CARDS ---------- */

  const connectTeams = [
    {
      name: displayChefName,
      role: "Executive Chef",
      team: "Culinary Team",
      image: "/assets/chef.jpg",
      link:
        "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2gOkj36Js9GK8IIG36DPWaSEviS7Km195Xuo-O4wI_9AOt6AleQuhJ2qogIEt3-eQEB0FRSFiI",
    },
    {
      name: "Sanjuktha Babu",
      role: "Customer Success Manager",
      team: "Growth Team",
      image: "/assets/Sanjuktha-Babu_Light.png",
      link:
        "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0sqwXdi-0lMbxcy9Rws29YWFm1fL3iGxKSdJZzE7aGoOpxBNoFWoVNOOyto2tPh7pEciz2FnD_",
    },
    {
      name: null,
      role: null,
      team: "Data Analytics Team",
      image: "/assets/Data-Analytics.jpg",
      link:
        "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ13vng14mL6kgbPsGMVQybs2i-ftRiB9dkgrgqzv3AYGDe-CG9w8ClBeYubraom6uq90V_YlgAx",
    },
  ];

  /* ---------- REST OF TEAM GRID ---------- */

  const teamMembers = [
    {
      name: displayChefName,
      role: "Executive Chef",
      team: "Culinary Team",
      image: "/assets/chef.jpg",
    },
    {
      name: "Sanjuktha Babu",
      role: "Customer Success Manager",
      team: "Growth Team",
      image: "/assets/Sanjuktha-Babu.png",
    },
    {
      name: "Tom Mathew",
      role: "Co-founder & COO",
      team: "Management Team",
      image: "/assets/Tom-Mathew.png",
    },
    {
      name: "Meghna Raj",
      role: "HR Generalist",
      team: "HR Department",
      image: "/assets/Meghna-Raj.png",
    },
    {
      name: "Lukose Jacob",
      role: "Data Analyst",
      team: "Data Analyst Team",
      image: "/assets/Lukose-Jacob.png",
    },
    {
      name: "Prabhavathi V",
      role: "Junior Purchase Manager",
      team: "Procurement Team",
      image: "/assets/Prabhavathi-V.png",
    },
  ];

  /* -------------------- UI -------------------- */

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">

        {/* ---------- CONNECT SECTION ---------- */}
        <section className="max-w-7xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Let's Connect and Solve
            </h1>
            <p className="text-xl text-gray-900 mb-6">
              Connect with the right expert for what you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {connectTeams.map((team, index) => (
              <div
                key={index}
                style={{ backgroundImage: `url(${team.image})` }}
                className="bg-cover bg-no-repeat bg-center flex flex-col justify-end rounded-xl p-6 h-[55vh] shadow-md"
              >
                {team.name && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                    {team.role && (
                      <p className="text-sm text-white">{team.role}</p>
                    )}
                  </div>
                )}

                <p className="text-sm font-semibold text-white mb-6">
                  {team.team}
                </p>

                <button
                  disabled={loading}
                  onClick={() => handleSchedule(team)}
                  className="w-full inline-flex items-center justify-center bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Schedule Call"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- OUR TEAMS ---------- */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Teams
            </h2>
            <p className="text-xl text-gray-900 mb-6">
              Powering the Best Restaurants in Bangalore
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {teamMembers.map((member, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  {member.team}
                </p>

                <img
                  src={member.image}
                  alt={member.name}
                  className="w-64 h-64 rounded-lg mx-auto object-cover grayscale"
                />

                <h3 className="text-lg font-bold text-gray-900 mt-4">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default ContactUs;
