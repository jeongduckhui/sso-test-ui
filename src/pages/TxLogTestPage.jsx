import { useState } from "react";
import PageContainer from "../components/common/PageContainer";
import CommonActionButtons from "../components/common/CommonActionButtons";
import { api } from "../api/axios";

export default function TxLogTestPage() {
  const [lastAction, setLastAction] = useState("");

  /**
   * 공통 버튼 클릭 핸들러
   */
  const handleAction = async (type) => {
    setLastAction(type);

    try {
      // ❌ txLog 없음 (완전히 제거됨)
      await api.get("/test/mock");

      alert(`${type} 요청 완료 (헤더 자동 포함)`);
    } catch (e) {
      console.error(e);
      alert("API 실패 (mock)");
    }
  };

  return (
    <PageContainer
      title="트랜잭션 로그 테스트 화면"
      description="공통 버튼 + 트랜잭션 타입 자동 세팅"
      actions={
        <CommonActionButtons
          buttons={["search", "save", "option"]}
          onAction={handleAction}
        />
      }
    >
      <div className="search-form">
        <div className="search-row">
          <div className="search-item">
            <label>조회조건1</label>
            <input placeholder="조건1 입력" />
          </div>

          <div className="search-item">
            <label>조회조건2</label>
            <input placeholder="조건2 입력" />
          </div>

          <div className="search-item">
            <label>조회조건3</label>
            <input placeholder="조건3 입력" />
          </div>

          <div className="search-item">
            <label>조회조건4</label>
            <input placeholder="조건4 입력" />
          </div>
        </div>

        <div>
          <strong>마지막 클릭 액션:</strong> {lastAction}
        </div>
      </div>
    </PageContainer>
  );
}
