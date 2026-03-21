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
        key: "mail",
        label: "메일",
        path: "/mail",
        icon: Mail,
      },
      {
        key: "cache",
        label: "캐시",
        path: "/cache",
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
