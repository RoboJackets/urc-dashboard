import { useState } from "react";

export const ToggleTheme = () => {
  const [isDark, toggleIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    toggleIsDark(!isDark);
  };
  return (
    <button
      className={isDark ? "hover:bg-yellow-400" : "hover:bg-yellow-500"}
      onClick={() => toggleTheme()}
    >
      Toggle Theme
    </button>
  );
};
