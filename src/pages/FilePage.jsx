import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import PageContainer from "../components/common/PageContainer";

export default function FilePage() {
  const { isLoggedIn } = useAuth();

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleMultipleChange = (e) => {
    setFiles(e.target.files);
  };

  const fetchFiles = async () => {
    const res = await api.get("/files/my");
    setFileList(res.data);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("업로드 성공");
      setFile(null);
      fetchFiles();
    } catch (e) {
      alert("업로드 실패");
    }
  };

  const handleUploadMultiple = async () => {
    if (!files || files.length === 0) {
      alert("파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      await api.post("/files/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("멀티 업로드 성공");
      setFiles([]);
      fetchFiles();
    } catch (e) {
      alert("멀티 업로드 실패");
    }
  };

  const handleDownload = async (fileId) => {
    const res = await api.get(`/files/download/${fileId}`);
    window.location.href = res.data;
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("삭제할까요?")) return;

    try {
      await api.delete(`/files/${fileId}`);
      alert("삭제 완료");
      fetchFiles();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFiles();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <div>로그인 후 사용 가능합니다.</div>;
  }

  return (
    <PageContainer
      title="파일 관리"
      description="단일 업로드, 멀티 업로드, 다운로드, 삭제를 테스트하는 화면"
    >
      <div className="upload-section">
        <div className="upload-box">
          <h3>단일 업로드</h3>
          <input type="file" onChange={handleFileChange} />
          <button className="primary-btn" onClick={handleUpload}>
            단일 업로드
          </button>
        </div>

        <div className="upload-box">
          <h3>멀티 업로드</h3>
          <input type="file" multiple onChange={handleMultipleChange} />
          <button className="primary-btn" onClick={handleUploadMultiple}>
            멀티 업로드
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="app-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>파일명</th>
              <th>크기</th>
              <th>다운로드</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {fileList.map((f) => (
              <tr key={f.fileId}>
                <td>{f.fileId}</td>
                <td>{f.originalName}</td>
                <td>{f.fileSize}</td>
                <td>
                  <button
                    className="secondary-btn"
                    onClick={() => handleDownload(f.fileId)}
                  >
                    다운로드
                  </button>
                </td>
                <td>
                  <button
                    className="danger-btn"
                    onClick={() => handleDelete(f.fileId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
