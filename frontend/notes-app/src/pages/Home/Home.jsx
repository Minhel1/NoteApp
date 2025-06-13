import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import AddEditNotes from "./AddEditNotes";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg";
import SharedNoteCard from "./SharedNoteCard";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ShareModal from "../../components/Share/ShareModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const Home = () => {
  const [clippedTitle, setClippedTitle] = useState("");
  const [clippedContent, setClippedContent] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true" || false
  );
  const [viewMode, setViewMode] = useState("tile");

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  const [shareModal, setShareModal] = useState({
    isOpen: false,
    note: null,
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNoteToShare, setSelectedNoteToShare] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [allNotes, setAllNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [sharedByMeNotes, setSharedByMeNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({ isShown: true, message, type });
  };

  const handleCloseToast = () => {
    setShowToastMsg({ isShown: false, message: "" });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const getUniqueLabels = (notes) => {
    const labelsSet = new Set();
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => labelsSet.add(tag));
    });
    return ["All", ...Array.from(labelsSet)];
  };

  const getSharedNotes = async () => {
    try {
      const response = await axiosInstance.get("/shared-notes");
      if (response.data && response.data.sharedNotes) {
        setSharedNotes(response.data.sharedNotes);
      }
    } catch (error) {
      console.error("Failed to fetch shared notes", error);
    }
  };

  const getSharedByMeNotes = async () => {
    try {
      const response = await axiosInstance.get("/shared-by-me");
      if (response.data && response.data.sharedByMe) {
        setSharedByMeNotes(response.data.sharedByMe);
      }
    } catch (error) {
      console.error("Failed to fetch notes shared by you", error);
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
        setSearchComplete(response.data.notes.length > 0);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [searchComplete, setSearchComplete] = useState(false);

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(
        `/update-note-pinned/${noteId}`,
        {
          isPinned: !noteData.isPinned,
        }
      );
      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        setAllNotes((prevNotes) => {
          const updatedNotes = prevNotes.map((note) =>
            note._id === noteId
              ? { ...note, isPinned: !noteData.isPinned }
              : note
          );
          return updatedNotes.sort((a, b) => b.isPinned - a.isPinned);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setSearchComplete(false);
    getAllNotes();
  };

  const handleShare = async (noteData) => {
    const email = prompt("Enter email to share this note with:");
    if (!email) return;

    try {
      const response = await axiosInstance.post(`/share-note/${noteData._id}`, {
        email,
      });

      if (response.data && response.data.success) {
        showToastMessage(`Note shared with ${email}`, "share");
        getSharedByMeNotes(); // refresh list if needed
      } else {
        showToastMessage(
          response.data.message || "Failed to share note.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to share note:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to share note. Try again.",
        "error"
      );
    }
  };

  const handleSubmitShare = async (email) => {
    if (!selectedNoteToShare) return;

    try {
      const response = await axiosInstance.post(
        `/share-note/${selectedNoteToShare._id}`,
        { email }
      );

      if (response.data?.success) {
        showToastMessage(`Note shared with ${email}`, "share");
        getSharedByMeNotes();
      } else {
        showToastMessage(
          response.data?.message || "Failed to share note.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to share note:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to share note. Try again.",
        "error"
      );
    }
  };
  const openShareModal = (note) => {
    setShareModal({ isOpen: true, note });
  };

  const confirmShare = async (email) => {
    const noteId = shareModal.note._id;
    try {
      const response = await axiosInstance.post(`/share-note/${noteId}`, {
        email,
      });

      if (response.data?.success) {
        showToastMessage(`Note shared with ${email}`, "share");
        getSharedByMeNotes();
      } else {
        showToastMessage(
          response.data.message || "Failed to share note.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to share note:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to share note.",
        "error"
      );
    }
  };

  const downloadNoteAsPDF = (title, content) => {
    const doc = new jsPDF();
    const cleanTitle = title || "Note";
    const cleanContent = stripHtmlTags(content);

    doc.setFontSize(16);
    doc.text(cleanTitle, 10, 20);

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(cleanContent, 180);
    doc.text(lines, 10, 30);

    doc.save(`${cleanTitle}.pdf`);
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleClip = async () => {
    try {
      const currentUrl = window.location.href;

      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}`
      );

      if (response.ok) {
        throw new Error("Failed to fetch page content");
      }

      const html = `
  <html><head><title>Test Local Note</title></head>
  <body><p>This is test content from local dev</p></body></html>
`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent || "Clipped Page";
      const bodyText =
        doc.body?.innerText?.slice(0, 2000) || "No readable content";

      const newNote = {
        title,
        content: `<p>${bodyText}</p>`,
        tags: ["clipped"],
      };

      // ✅ Make sure this matches your existing backend route
      const res = await axiosInstance.post("/add-note", newNote);

      if (res.data?.note) {
        toast.success("Page clipped successfully!");
      } else {
        throw new Error("Backend failed to save note");
      }
    } catch (error) {
      console.error("Clip error:", error);
      toast.error("Failed to clip this page.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, allNotesRes, sharedRes, sharedByMeRes] =
          await Promise.all([
            axiosInstance.get("/get-user"),
            axiosInstance.get("/get-all-notes"),
            axiosInstance.get("/shared-notes"),
            axiosInstance.get("/shared-by-me"),
          ]);
        if (userRes.data?.user) setUserInfo(userRes.data.user);
        if (allNotesRes.data?.notes) setAllNotes(allNotesRes.data.notes);
        if (sharedRes.data?.sharedNotes)
          setSharedNotes(sharedRes.data.sharedNotes);
        if (sharedByMeRes.data?.sharedByMe)
          setSharedByMeNotes(sharedByMeRes.data.sharedByMe);
      } catch (err) {
        console.error("Failed to fetch some data:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };
    fetchData();

    const initializeData = async () => {
      await Promise.all([
        getAllNotes(),
        getUserInfo(),
        getSharedNotes(),
        getSharedByMeNotes(),
      ]);
    };
    initializeData();
  }, []);

  const handlePin = async (noteId) => {
    try {
      await axiosInstance.put(`/pin-note/${noteId}`);
      showToastMessage("Note pinned successfully");
      getAllNotes();
    } catch (error) {
      showToastMessage("Failed to pin note");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
        darkMode={darkMode}
      />

      <main className="container mx-auto px-4 py-10">
        {searchComplete && (
          <div className="text-green-600 font-medium text-center mb-4">
            ✅ Search Complete
          </div>
        )}

        {allNotes.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Notes</h2>
              <button
                className="w-10 h-10 flex items-center justify-center border rounded-lg dark:border-gray-500 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title={`Switch to ${
                  viewMode === "tile" ? "Content" : "Tile"
                } View`}
                onClick={() =>
                  setViewMode(viewMode === "tile" ? "content" : "tile")
                }
              >
                {viewMode === "tile" ? "📃" : "🔳"}
              </button>
            </div>
            <div
              className={`${
                viewMode === "tile"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }`}
            >
              {allNotes.map((item) => (
                <NoteCard
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                  onShare={() => handleShare(item)}
                  onDownload={() => downloadNoteAsPDF(item.title, item.content)} // ✅ NEW FUNCTION
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NoDataImg : AddNotesImg}
            message={
              isSearch
                ? "Oops! No notes found matching your search."
                : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"
            }
          />
        )}
      </main>
      <button
        aria-label="Add Note"
        className="fixed right-8 bottom-24 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out group focus:outline-none focus:ring-4 focus:ring-indigo-300 z-50 flex items-center justify-center"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-white text-4xl transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.25)", zIndex: 10000 },
        }}
        contentLabel="Add/Edit Note Modal"
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 backdrop-blur-md rounded-xl mx-auto mt-10 p-4 overflow-auto shadow-md focus:outline-none"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
          clippedTitle={clippedTitle} // ensure this is set
          clippedContent={clippedContent}
          userInfo={userInfo}
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onRequestClose={() => setShareModal({ isOpen: false, note: null })}
        onShare={confirmShare}
        noteTitle={shareModal.note?.title}
      />
    </div>
  );
};

export default Home;
