import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";

export default function LogoutButton({ className = "btn secondary" }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <button className={className} type="button" onClick={handleLogout}>
      Log out
    </button>
  );
}
