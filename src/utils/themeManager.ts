
export const createThemeManager = () => {
  const getTheme = () => localStorage.getItem("fakefinder_theme") || "light";
  
  const setTheme = (theme: string) => {
    localStorage.setItem("fakefinder_theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  return { getTheme, setTheme };
};
