import { useEffect } from "react";
import { getOpenedTabs } from "../txlog/screenContext";

export default function useUnloadUserAccessEnd() {
  useEffect(() => {
    const handleUnload = () => {
      const tabs = getOpenedTabs();

      if (!tabs || tabs.length === 0) return;

      tabs.forEach((tab) => {
        const data = new Blob([JSON.stringify({ funcId: tab.key })], {
          type: "application/json",
        });

        navigator.sendBeacon("http://localhost:8081/user-access-log/end", data);
      });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
}
