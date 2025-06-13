import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { MdNotifications } from "react-icons/md";
import ProfileInfo from "../Cards/Profileinfo";
import SearchBar from "../SearchBar/SearchBar";
import { Sun, Moon } from "lucide-react";
import { io } from "socket.io-client";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, hideSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== null
      ? JSON.parse(saved)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [dueReminders, setDueReminders] = useState([]);
  const [showDot, setShowDot] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) onSearchNote(searchQuery);
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const toggleBellPanel = () => {
    setShowPanel((prev) => !prev);
    setShowDot(false); // Hide red dot when bell is clicked
  };

  const clearReminders = () => {
    setDueReminders([]);
    setShowDot(false); // Hide red dot when cleared
  };

  // Fetch due reminders on mount
  useEffect(() => {
    if (!userInfo?._id) return;

    const fetchReminders = async () => {
      try {
        const { data } = await axiosInstance.get("/reminders-due", {
          params: { userId: userInfo._id },
        });

        if (data.reminders?.length) {
          // Only set red dot if the new reminders differ from current ones
          const isNew = data.reminders.some(
            (newR) => !dueReminders.find((r) => r._id === newR._id)
          );

          setDueReminders(data.reminders);
          if (isNew) setShowDot(true);
        } else {
          setDueReminders([]);
        }
      } catch (err) {
        console.error("Error fetching reminders", err);
      }
    };

    fetchReminders();
  }, [userInfo, dueReminders]);

  // Real-time reminder updates via Socket.IO
  useEffect(() => {
    if (!userInfo?._id) return;

    const socket = io("http://localhost:8000", {
      query: { userId: userInfo._id },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("reminder-due", (reminderNote) => {
      console.log("📥 New reminder received:", reminderNote);
      setDueReminders((prev) => [...prev, reminderNote]);
      setShowDot(true);
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    return () => socket.disconnect();
  }, [userInfo?._id]);

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex items-center justify-between px-4 py-2 shadow-sm border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50">
      <h1 className="text-2xl sm:text-3xl font-black tracking-wide select-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Notes
      </h1>

      <div className="flex-1 max-w-md mx-4">
        {!hideSearch && (
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => setSearchQuery(target.value)}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
        )}
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-gray-600 dark:text-yellow-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleBellPanel}
            className="relative p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <MdNotifications className="text-2xl text-gray-700 dark:text-gray-200" />
            {showDot && (
              <>
                <span className="absolute top-0 right-0 inline-block w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 inline-block w-2.5 h-2.5 bg-red-600 rounded-full" />
              </>
            )}
          </button>

          {/* Dropdown Panel */}
          {showPanel && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 max-h-60 overflow-y-auto">
                {dueReminders.length > 0 ? (
                  dueReminders.map((note, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-semibold">{note.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(note.reminderDate).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500">
                    No reminders
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-center">
                <button
                  onClick={clearReminders}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </nav>
  );
};

export default Navbar;
