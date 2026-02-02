import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
        )
    }

    const isDark = theme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${isDark ? "bg-slate-700" : "bg-indigo-100"
                }`}
            aria-label="Toggle Dark Mode"
        >
            <span
                className={`${isDark ? "translate-x-7 bg-slate-950" : "translate-x-1 bg-white"
                    } pointer-events-none flex h-6 w-6 items-center justify-center rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out`}
            >
                {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                ) : (
                    <Sun className="h-3.5 w-3.5 text-orange-400" />
                )}
            </span>
        </button>
    )
}
