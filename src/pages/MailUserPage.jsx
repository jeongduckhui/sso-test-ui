import { useState } from "react";
import api from "../api/axios";
import PageContainer from "../components/common/PageContainer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXT = ["png", "jpg", "jpeg", "gif", "pdf"];

export default function MailUserPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // =========================
  // 파일 검증
  // =========================
  const validateFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXT.includes(ext)) {
      alert(`허용되지 않은 파일 형식: ${ext}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`파일 크기 초과 (5MB 제한): ${file.name}`);
      return false;
    }

    return true;
  };

  // =========================
  // 파일 추가
  // =========================
  const addFiles = (selectedFiles) => {
    const validFiles = [];

    selectedFiles.forEach((file) => {
      if (!validateFile(file)) return;

      // 중복 방지 (이름 + 사이즈)
      const exists = files.some(
        (f) => f.name === file.name && f.size === file.size,
      );
      if (!exists) validFiles.push(file);
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
  };

  // =========================
  // 드래그 업로드
  // =========================
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // =========================
  // 삭제
  // =========================
  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // 메일 발송
  // =========================
  const handleSendMail = async () => {
    if (!to || !subject || !content) {
      alert("모든 값을 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const emails = to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      const formData = new FormData();
      formData.append("to", JSON.stringify(emails));
      formData.append("subject", subject);
      formData.append("content", content);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post("/mail/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("메일 발송 성공");

      setTo("");
      setSubject("");
      setContent("");
      setFiles([]);
    } catch (e) {
      console.error(e);
      alert("메일 발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="개인 메일 발송">
      <div style={styles.form}>
        {/* 이메일 */}
        <div style={styles.row}>
          <label style={styles.label}>수신 이메일</label>
          <input
            style={styles.input}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="example@gmail.com, test@gmail.com"
          />
        </div>

        {/* 제목 */}
        <div style={styles.row}>
          <label style={styles.label}>제목</label>
          <input
            style={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* 내용 */}
        <div style={styles.row}>
          <label style={styles.label}>내용</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* 첨부파일 */}
        <div style={styles.row}>
          <label style={styles.label}>첨부파일</label>

          <div style={{ flex: 1 }}>
            {/* 드롭존 */}
            <div
              style={{
                ...styles.dropZone,
                borderColor: dragActive ? "#1677ff" : "#ccc",
                background: dragActive ? "#f0f8ff" : "#fafafa",
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p>파일을 드래그하거나 클릭해서 업로드</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={styles.hiddenInput}
              />
            </div>

            {/* 파일 리스트 */}
            {files.length > 0 && (
              <div style={styles.fileGrid}>
                {files.map((file, index) => {
                  const isImage = file.type.startsWith("image/");

                  return (
                    <div key={index} style={styles.fileCard}>
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          style={styles.thumbnail}
                        />
                      ) : (
                        <div style={styles.fileIcon}>📄</div>
                      )}

                      <div style={styles.fileName}>{file.name}</div>

                      <button
                        style={styles.removeBtn}
                        onClick={() => handleRemoveFile(index)}
                      >
                        삭제
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div style={styles.buttonRow}>
          <button
            style={styles.button}
            onClick={handleSendMail}
            disabled={loading}
          >
            {loading ? "발송 중..." : "메일 발송"}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

/* ================= 스타일 ================= */

const styles = {
  form: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  label: {
    width: "120px",
    fontWeight: "600",
    marginTop: "8px",
  },
  input: {
    flex: 1,
    padding: "10px",
  },
  textarea: {
    flex: 1,
    height: "140px",
    padding: "10px",
  },
  dropZone: {
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    top: 0,
    left: 0,
    cursor: "pointer",
  },
  fileGrid: {
    marginTop: "15px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 120px)",
    gap: "10px",
  },
  fileCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
    background: "#fff",
  },
  thumbnail: {
    width: "100%",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  fileIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  fileName: {
    fontSize: "12px",
    margin: "5px 0",
    wordBreak: "break-all",
  },
  removeBtn: {
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    padding: "4px 6px",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "12px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    padding: "12px 24px",
    background: "#1677ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
