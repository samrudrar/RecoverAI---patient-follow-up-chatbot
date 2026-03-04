import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
                <Moon className="w-4 h-4 text-slate-600" />
            )}
        </Button>
    );
};

export default DarkModeToggle;
