import { findMenuByPath } from "../config/menuConfig";

const CURRENT_SCREEN_CONTEXT_KEY = "currentScreenContext";
const OPENED_TABS_KEY = "openedTabs";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function toScreenContext(menu) {
  if (!menu) {
    return null;
  }

  return {
    menuKey: menu.key ?? "",
    path: menu.path ?? "",
    label: menu.label ?? "",
    programId: menu.key ?? "",
    programName: menu.key ?? "",
    programTitleName: menu.key ?? "",
    funcId: menu.key ?? "",

    // 공통버튼 추가
    buttons: menu.buttons ?? [],
  };
}

export function getCurrentScreenContext() {
  return safeParse(sessionStorage.getItem(CURRENT_SCREEN_CONTEXT_KEY), null);
}

export function setCurrentScreenContext(screenContext) {
  if (!screenContext) {
    sessionStorage.removeItem(CURRENT_SCREEN_CONTEXT_KEY);
    return;
  }

  sessionStorage.setItem(
    CURRENT_SCREEN_CONTEXT_KEY,
    JSON.stringify(screenContext),
  );
}

export function setCurrentScreenContextByMenu(menu) {
  const context = toScreenContext(menu);
  setCurrentScreenContext(context);
  return context;
}

export function setCurrentScreenContextByPath(pathname) {
  const menu = findMenuByPath(pathname);
  return setCurrentScreenContextByMenu(menu);
}

export function getOpenedTabs() {
  return safeParse(sessionStorage.getItem(OPENED_TABS_KEY), []);
}

export function setOpenedTabs(tabs) {
  sessionStorage.setItem(OPENED_TABS_KEY, JSON.stringify(tabs));
}

export function openMenuTab(menu) {
  if (!menu) {
    return getOpenedTabs();
  }

  const tabs = getOpenedTabs();
  const exists = tabs.some((tab) => tab.path === menu.path);

  const nextTabs = exists
    ? tabs
    : [
        ...tabs,
        {
          key: menu.key,
          path: menu.path,
          label: menu.label,
        },
      ];

  setOpenedTabs(nextTabs);
  setCurrentScreenContextByMenu(menu);

  return nextTabs;
}

export function activateTabByPath(pathname) {
  return setCurrentScreenContextByPath(pathname);
}

export function closeTabByPath(pathname) {
  const nextTabs = getOpenedTabs().filter((tab) => tab.path !== pathname);
  setOpenedTabs(nextTabs);
  return nextTabs;
}
