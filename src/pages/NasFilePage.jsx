import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import PageContainer from "../components/common/PageContainer";

/**
 * NAS 파일 관리 테스트 화면.
 *
 * 단일 업로드, 멀티 업로드, 다운로드, 삭제를 테스트함.
 * NAS 다운로드는 백엔드에서 파일 바이너리를 직접 내려주므로 blob 방식으로 처리함.
 */
export default function NasFilePage() {
  const { isLoggedIn } = useAuth();

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);

  const singleFileInputRef = useRef(null);
  const multipleFileInputRef = useRef(null);

  /**
   * 단일 업로드 파일 선택 이벤트를 처리함.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e 파일 선택 이벤트
   */
  const handleFileChange = (e) => {
    // 선택한 첫 번째 파일을 상태에 저장함.
    setFile(e.target.files?.[0] ?? null);
  };

  /**
   * 멀티 업로드 파일 선택 이벤트를 처리함.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e 파일 선택 이벤트
   */
  const handleMultipleChange = (e) => {
    // 선택한 FileList를 배열로 변환해서 상태에 저장함.
    setFiles(Array.from(e.target.files ?? []));
  };

  /**
   * 내 파일 목록을 조회함.
   */
  const fetchFiles = async () => {
    // 내 파일 목록 API를 호출함.
    const res = await api.get("/files/my");

    // ApiResult 구조와 일반 배열 구조를 모두 대응해서 파일 목록을 저장함.
    setFileList(res.data?.data ?? res.data ?? []);
  };

  /**
   * 단일 파일을 업로드함.
   */
  const handleUpload = async () => {
    // 업로드할 파일이 선택되지 않았는지 확인함.
    if (!file) {
      // 파일 미선택 안내를 표시함.
      alert("파일을 선택하세요.");

      // 업로드 처리를 중단함.
      return;
    }

    // multipart/form-data 전송을 위한 FormData 객체를 생성함.
    const formData = new FormData();

    // FormData에 단일 파일을 추가함.
    formData.append("file", file);

    try {
      // 단일 파일 업로드 API를 호출함.
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 업로드 성공 안내를 표시함.
      alert("업로드 성공");

      // 단일 파일 상태를 초기화함.
      setFile(null);

      // 단일 파일 input 값을 초기화함.
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = "";
      }

      // 파일 목록을 다시 조회함.
      fetchFiles();
    } catch (e) {
      // 업로드 실패 안내를 표시함.
      alert("업로드 실패");
    }
  };

  /**
   * 여러 파일을 업로드함.
   */
  const handleUploadMultiple = async () => {
    // 업로드할 파일이 선택되지 않았는지 확인함.
    if (!files || files.length === 0) {
      // 파일 미선택 안내를 표시함.
      alert("파일을 선택하세요.");

      // 업로드 처리를 중단함.
      return;
    }

    // multipart/form-data 전송을 위한 FormData 객체를 생성함.
    const formData = new FormData();

    // 선택한 파일 목록을 순회함.
    files.forEach((selectedFile) => {
      // FormData에 멀티 파일 파라미터명으로 파일을 추가함.
      formData.append("files", selectedFile);
    });

    try {
      // 멀티 파일 업로드 API를 호출함.
      await api.post("/files/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 멀티 업로드 성공 안내를 표시함.
      alert("멀티 업로드 성공");

      // 멀티 파일 상태를 초기화함.
      setFiles([]);

      // 멀티 파일 input 값을 초기화함.
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = "";
      }

      // 파일 목록을 다시 조회함.
      fetchFiles();
    } catch (e) {
      // 멀티 업로드 실패 안내를 표시함.
      alert("멀티 업로드 실패");
    }
  };

  /**
   * NAS 파일을 다운로드함.
   *
   * @param {number} fileId 파일 ID
   * @param {string} originalName 원본 파일명
   */
  const handleDownload = async (fileId, originalName) => {
    try {
      // 파일 다운로드 API를 blob 응답으로 호출함.
      const res = await api.get(`/files/download/${fileId}`, {
        responseType: "blob",
      });

      // 응답 데이터를 Blob 객체로 생성함.
      const blob = new Blob([res.data], {
        type: res.headers?.["content-type"] ?? "application/octet-stream",
      });

      // Blob 객체를 브라우저에서 접근 가능한 임시 URL로 생성함.
      const url = window.URL.createObjectURL(blob);

      // 다운로드를 실행하기 위한 a 태그를 생성함.
      const a = document.createElement("a");

      // a 태그의 href에 임시 URL을 설정함.
      a.href = url;

      // 다운로드 파일명을 원본 파일명으로 설정함.
      a.download = originalName;

      // a 태그를 문서 body에 추가함.
      document.body.appendChild(a);

      // a 태그 클릭 이벤트를 발생시켜 다운로드를 실행함.
      a.click();

      // 사용한 a 태그를 문서에서 제거함.
      a.remove();

      // 생성한 임시 URL을 해제함.
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // 다운로드 실패 안내를 표시함.
      alert("다운로드 실패");
    }
  };

  /**
   * 파일을 삭제함.
   *
   * @param {number} fileId 파일 ID
   */
  const handleDelete = async (fileId) => {
    // 삭제 여부를 사용자에게 확인함.
    if (!window.confirm("삭제할까요?")) return;

    try {
      // 파일 삭제 API를 호출함.
      await api.delete(`/files/${fileId}`);

      // 삭제 성공 안내를 표시함.
      alert("삭제 완료");

      // 파일 목록을 다시 조회함.
      fetchFiles();
    } catch (e) {
      // 삭제 실패 안내를 표시함.
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    // 로그인 상태인지 확인함.
    if (isLoggedIn) {
      // 로그인 상태이면 내 파일 목록을 조회함.
      fetchFiles();
    }
  }, [isLoggedIn]);

  // 로그인하지 않은 경우 안내 문구를 표시함.
  if (!isLoggedIn) {
    return <div>로그인 후 사용 가능합니다.</div>;
  }

  return (
    <PageContainer
      title="NAS 파일 관리"
      description="NAS 기반 단일 업로드, 멀티 업로드, 다운로드, 삭제를 테스트하는 화면"
    >
      <div className="upload-section">
        <div className="upload-box">
          <h3>단일 업로드</h3>
          <input
            ref={singleFileInputRef}
            type="file"
            onChange={handleFileChange}
          />
          <button className="primary-btn" onClick={handleUpload}>
            단일 업로드
          </button>
        </div>

        <div className="upload-box">
          <h3>멀티 업로드</h3>
          <input
            ref={multipleFileInputRef}
            type="file"
            multiple
            onChange={handleMultipleChange}
          />
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
                    onClick={() => handleDownload(f.fileId, f.originalName)}
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

            {fileList.length === 0 && (
              <tr>
                <td colSpan={5}>조회된 파일이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
