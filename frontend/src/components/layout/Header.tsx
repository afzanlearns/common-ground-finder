import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  variant?: "landing" | "auth" | "app";
  showNav?: boolean;
}

export function Header({ variant = "landing", showNav = true }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-80 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" fill="currentColor">
              <circle cx="12" cy="8" r="2" />
              <circle cx="8" cy="14" r="2" />
              <circle cx="16" cy="14" r="2" />
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <span className="font-serif text-lg tracking-tight">Common-Ground</span>
        </Link>

        {showNav && variant === "landing" && (
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || ""} alt={user.email || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || user.email?.split('@')[0]}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/create-group" className="cursor-pointer w-full flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hover-lift" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="hero" size="sm" className="hover-lift" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        )}

        {variant === "auth" && (
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hover-lift" asChild>
              <Link to="/" className="flex items-center gap-1.5">
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Home
              </Link>
            </Button>
          </nav>
        )}

        {variant === "app" && (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center rounded-full bg-secondary/50 p-1 border border-border/50">
              <Link 
                to="/create-group" 
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  location.pathname === '/create-group' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Create
              </Link>
              <Link 
                to="/preferences" 
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  location.pathname.includes('/preferences')
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Join
              </Link>
              <Link 
                to="/results" 
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  location.pathname.includes('/results')
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Results
              </Link>
            </nav>
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || ""} alt={user.email || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || user.email?.split('@')[0]}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!user && (
                 <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
