import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
    theme: "system",
    setTheme: () => null,
})

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}) {
    const [theme, setThemeState] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme
    )

    const [resolvedTheme, setResolvedTheme] = useState(() => {
        if (typeof window === "undefined") return "light"
        const stored = localStorage.getItem(storageKey)
        if (stored === "dark" || stored === "light") return stored
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    })

    useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        const applyTheme = () => {
            root.classList.remove("light", "dark")
            const currentSystem = mediaQuery.matches ? "dark" : "light"
            const effective = theme === "system" ? currentSystem : theme

            root.classList.add(effective)
            setResolvedTheme(effective)
        }

        applyTheme()

        const handleMediaChange = () => {
            if (theme === "system") {
                applyTheme()
            }
        }

        mediaQuery.addEventListener("change", handleMediaChange)
        return () => mediaQuery.removeEventListener("change", handleMediaChange)
    }, [theme])

    const value = {
        theme,
        resolvedTheme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme)
            setThemeState(newTheme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
