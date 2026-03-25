import {
  Home,
  FolderOpen,
  Mail,
  Database,
  Shield,
  FileText,
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
        key: "files",
        label: "파일 관리",
        path: "/files",
        icon: FolderOpen,
      },
      {
        key: "mailsend",
        label: "개인 메일 발송",
        path: "/mail/user",
        icon: Mail,
      },
      {
        key: "mailsend",
        label: "시스템 메일 발송",
        path: "/mail/system",
        icon: Mail,
      },
      {
        key: "maillog",
        label: "메일 로그 관리",
        path: "/mail/log",
        icon: Mail,
      },
      {
        key: "cache",
        label: "캐시",
        path: "/cache",
        icon: Database,
      },

      {
        key: "paging",
        label: "페이징",
        path: "/paging",
        icon: FileText,
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
