import {
  Home,
  FolderOpen,
  Mail,
  Database,
  Shield,
  FileText,
  MessageSquareText,
} from "lucide-react";

export const menuConfig = [
  {
    section: "기본",
    items: [
      {
        key: "home",
        label: "홈",
        path: "/",
        icon: Home,
      },
    ],
  },
  {
    section: "공통 기능",
    items: [
      {
        key: "s3Files",
        label: "S3 파일 관리",
        path: "/files/s3",
        icon: FolderOpen,
      },
      {
        key: "nasFiles",
        label: "NAS 파일 관리",
        path: "/files/nas",
        icon: FolderOpen,
      },
      {
        key: "mailUser",
        label: "개인 메일 발송",
        path: "/mail/user",
        icon: Mail,
      },
      {
        key: "mailSystem",
        label: "시스템 메일 발송",
        path: "/mail/system",
        icon: Mail,
      },
      {
        key: "mailLog",
        label: "메일 로그 관리",
        path: "/mail/log",
        icon: Mail,
      },
      {
        key: "message",
        label: "메시지",
        path: "/message",
        icon: MessageSquareText,
      },
      {
        key: "cache",
        label: "캐시",
        path: "/cache",
        icon: Database,
      },
      {
        key: "cacheAdmin",
        label: "캐시 관리자",
        path: "/cache/admin",
        icon: Database,
      },
      {
        key: "cacheMonitor",
        label: "캐시 모니터",
        path: "/cache/monitor",
        icon: Database,
      },
      {
        key: "paging",
        label: "페이징",
        path: "/paging",
        icon: FileText,
      },
      {
        key: "txlog",
        label: "트랜잭션 로그",
        path: "/txlog",
        icon: FileText,
      },
      {
        key: "txlogdbsetting",
        label: "트랜잭션 로그 DB",
        path: "/txlogdbsetting",
        icon: FileText,
        buttons: [
          { type: "SEARCH", useYn: "Y" },
          { type: "SAVE", useYn: "Y" },
          { type: "OPTION", useYn: "Y" },
          { type: "RESET", useYn: "N" },
        ],
      },
      {
        key: "snapshotGrid",
        label: "스냅샷 그리드",
        path: "/snapshot-grid",
        icon: Database,
      },
      {
        key: "dynamicGridExcel",
        label: "동적 그리드 엑셀",
        path: "/dynamic-grid-excel",
        icon: Database,
      },
      {
        key: "dynamicGridExcelTest",
        label: "엑셀 테스트",
        path: "/dynamic-grid-excel-test",
        icon: Database,
      },
      {
        key: "exceptionTest",
        label: "예외 테스트",
        path: "/exception-sample",
        icon: Database,
      },
      {
        key: "multiTabDimensionTemplate",
        label: "멀티탭 디멘전 템플릿",
        path: "/multi-tab-dimension-template",
        icon: Database,
      },
      {
        key: "multiTabSplitDimensionTemplate",
        label: "멀티탭 스플릿 디멘전 템플릿",
        path: "/multi-tab-split-dimension-template",
        icon: Database,
      },
      {
        key: "multiTabSplitDimensionTemplateVer2",
        label: "멀티탭 스플릿 디멘전 템플릿 Ver2",
        path: "/multi-tab-split-dimension-template-ver2",
        icon: Database,
      },
    ],
  },
  {
    section: "보안/운영",
    items: [
      {
        key: "auth",
        label: "인증 테스트",
        path: "/",
        icon: Shield,
      },
      {
        key: "logs",
        label: "로그/추적",
        path: "/",
        icon: FileText,
      },
    ],
  },
];

export const allMenuItem = menuConfig.reduce((acc, section) => {
  section.items.forEach((item) => {
    acc[item.key] = item;
  });
  return acc;
}, {});

export function findMenuByPath(pathname) {
  for (const section of menuConfig) {
    for (const item of section.items) {
      if (item.path === pathname) {
        return item;
      }
    }
  }
  return null;
}

export function findMenuByKey(key) {
  return allMenuItem[key] ?? null;
}
