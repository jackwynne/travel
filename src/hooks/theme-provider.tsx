import {
	createContext,
	type PropsWithChildren,
	use,
	useEffect,
	useState,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ui-theme";

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };

const ThemeContext = createContext<ThemeContextVal | null>(null);

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "light";
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "dark" || stored === "light") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	function setTheme(val: Theme) {
		setThemeState(val);
	}

	return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
	const val = use(ThemeContext);
	if (!val) throw new Error("useTheme called outside of ThemeProvider!");
	return val;
}
