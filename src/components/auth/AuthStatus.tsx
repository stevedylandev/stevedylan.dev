import {
	useState,
	useEffect,
	createContext,
	useContext,
	type ReactNode,
} from "react";

interface AuthState {
	authenticated: boolean;
	did?: string;
	handle?: string;
	loading: boolean;
}

interface AuthContextType extends AuthState {
	login: () => void;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.stevedylan.dev";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>({
		authenticated: false,
		loading: true,
	});

	const checkAuthStatus = async () => {
		try {
			const response = await fetch(`${API_URL}/auth/status`, {
				credentials: "include",
			});
			const data = await response.json();
			setAuthState({
				authenticated: data.authenticated,
				did: data.did,
				handle: data.handle,
				loading: false,
			});
		} catch (error) {
			console.error("Failed to check auth status:", error);
			setAuthState({ authenticated: false, loading: false });
		}
	};

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const login = () => {
		window.location.href = `${API_URL}/auth/login`;
	};

	const logout = async () => {
		try {
			await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				credentials: "include",
			});
			setAuthState({ authenticated: false, loading: false });
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const refresh = async () => {
		await checkAuthStatus();
	};

	return (
		<AuthContext.Provider value={{ ...authState, login, logout, refresh }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export function LoginButton() {
	const { authenticated, loading, login, logout } = useAuth();

	if (loading) {
		return <div className="text-sm text-gray-400">Checking auth...</div>;
	}

	if (authenticated) {
		return (
			<button
				type="button"
				onClick={logout}
				className="text-sm px-3 py-1.5 border border-white"
			>
				Logout
			</button>
		);
	}

	return (
		<button
			onClick={login}
			type="button"
			className="text-sm px-3 py-1.5 border border-white transition-colors"
		>
			Login with ATProto
		</button>
	);
}
