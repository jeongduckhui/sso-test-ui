import { useEffect, useState } from "react";
import PageContainer from "../components/common/PageContainer";
import CommonActionButtonsDBSetting from "../components/common/CommonActionButtonsDBSetting";
import { api } from "../api/axios";

export default function TxLogTestPageDBSetting() {
  const [lastAction, setLastAction] = useState("");

  /**
   * 버튼 클릭
   */
  const handleAction = async (type) => {
    setLastAction(type);

    try {
      // await api.get("/test/mock");

      alert(`${type} 요청 완료 (DB 버튼 기반)`);
    } catch (e) {
      console.error(e);
      alert("API 실패");
    }
  };

  return (
    <PageContainer
      title="트랜잭션 로그 테스트 (DB 버튼)"
      description="메뉴에서 버튼 정보 받아서 렌더링"
      actions={<CommonActionButtonsDBSetting onAction={handleAction} />}
    >
      <div className="search-form">
        <div className="search-row">
          <div className="search-item">
            <label>조회조건1</label>
            <input />
          </div>

          <div className="search-item">
            <label>조회조건2</label>
            <input />
          </div>
        </div>

        <div>
          <strong>마지막 클릭 액션:</strong> {lastAction}
        </div>
      </div>
    </PageContainer>
  );
}
